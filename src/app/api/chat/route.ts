import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type UIMessage } from 'ai';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { AgentId } from '@/store/useAppStore';

// Allow up to 60 seconds for free-tier models that may be slow under load
export const maxDuration = 60;

const CONCISE_INSTRUCTIONS = ` Keep your answers clear, concise, and to the point. Do not repeat information from previous messages. Do not use markdown formatting such as asterisks (*), double asterisks (**), hash symbols (#), or backticks in your responses. Write in plain text only. Only give detailed or in-depth answers when the user explicitly asks for a deep explanation or research.`;

export const MASTER_PROMPTS: Record<AgentId, string> = {
  prism: "You are Prism, the central orchestrator and general advanced AI assistant by Vitreon. You are highly capable at general coding, architecture, and routing users to specific solutions." + CONCISE_INSTRUCTIONS,
  lucent: "You are Lucent, a research & knowledge agent for Vitreon. You excel at finding information, synthesizing complex research papers, web search insights, and summarization." + CONCISE_INSTRUCTIONS,
  refract: "You are Refract, a deeply technical code agent for Vitreon. You specialize in writing robust code, debugging complex issues, algorithms, and strict performance optimizations." + CONCISE_INSTRUCTIONS,
  spectrum: "You are Spectrum, a creative and content-focused agent for Vitreon. You specialize in ideation, writing creative copy, storytelling, and UI/UX design concepts." + CONCISE_INSTRUCTIONS,
  facet: "You are Facet, a data & analysis agent for Vitreon. You specialize in interpreting structured data, generating charts, statistical reasoning, and data engineering." + CONCISE_INSTRUCTIONS,
  echo: "You are Echo, a memory and context agent for Vitreon. You specialize in recalling past context, summarizing long conversations, and helping manage the user's history." + CONCISE_INSTRUCTIONS
};

export async function POST(req: Request) {
  try {
    // --- Auth first, before touching anything else ---
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
      }
    });

    // --- Single body read; chatId can arrive via body or header ---
    const body = await req.json();
    const {
      messages,
      agent = 'prism',
      model = 'nvidia/nemotron-3.5-lightning:free',
    }: { messages: UIMessage[]; agent?: string; model?: string } = body;

    const chatId: string | undefined = body.chatId || req.headers.get('x-chat-id') || undefined;

    const systemPrompt = MASTER_PROMPTS[agent as AgentId] || MASTER_PROMPTS.prism;

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Extract plain text from the last message — used for DB storage and chat titles
    const lastMessage: any = messages[messages.length - 1];
    let messageText = '';
    if (lastMessage) {
      if (typeof lastMessage.content === 'string') {
        messageText = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        messageText = lastMessage.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n');
      } else if (Array.isArray(lastMessage.parts)) {
        messageText = lastMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n');
      }
    }

    // --- Ownership check on an existing chat (fixes IDOR); create a new one only if none was supplied ---
    let currentChatId = chatId;
    if (currentChatId) {
      const owned = await prisma.chat.findUnique({
        where: { id: currentChatId, userId: dbUser.id },
      });
      if (!owned) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
    } else {
      const chat = await prisma.chat.create({
        data: {
          userId: dbUser.id,
          title: messageText.slice(0, 50) || 'New Chat',
        }
      });
      currentChatId = chat.id;
    }

    // --- Atomic credit deduction — prevents race-condition overspend ---
    const spendFromSub = dbUser.subscriptionCredits > 0;
    const spend = await prisma.user.updateMany({
      where: {
        id: dbUser.id,
        ...(spendFromSub ? { subscriptionCredits: { gt: 0 } } : { credits: { gt: 0 } }),
      },
      data: spendFromSub
        ? { subscriptionCredits: { decrement: 1 } }
        : { credits: { decrement: 1 } },
    });
    if (spend.count === 0) {
      return NextResponse.json(
        { error: 'You have run out of credits. Please recharge or upgrade your subscription.' },
        { status: 402 }
      );
    }

    if (lastMessage) {
      // Fire and forget — reduces time-to-first-token
      prisma.message.create({
        data: {
          chatId: currentChatId,
          role: lastMessage.role || 'user',
          content: messageText,
        }
      }).catch(err => console.error("Error saving user message:", err));
    }

    // Only send the latest user message to the model to prevent it from
    // repeating all previous answers. The system prompt provides personality;
    // the user's current question is the only thing the model needs.
    const lastUserMessage = messages.filter((m: UIMessage) => m.role === 'user').pop();
    let lastUserText = '';
    if (lastUserMessage) {
      if (typeof (lastUserMessage as any).content === 'string') {
        lastUserText = (lastUserMessage as any).content;
      } else if (Array.isArray((lastUserMessage as any).parts)) {
        lastUserText = (lastUserMessage as any).parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      } else if (Array.isArray((lastUserMessage as any).content)) {
        lastUserText = (lastUserMessage as any).content
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      }
    }

    const result = streamText({
      model: openrouter(model),
      system: systemPrompt,
      // Send only the current question — no conversation history — to prevent
      // the model from echoing all prior answers back.
      messages: [{ role: 'user' as const, content: lastUserText || messageText }],
      // Cap output to prevent runaway generation that causes timeouts on free models
      maxOutputTokens: 1024,
      // Retry transient failures (network blips, temporary 429s) automatically
      maxRetries: 2,
      onFinish: async ({ text }) => {
        try {
          // Strip any remaining markdown artifacts before saving
          const cleanText = text
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
            .replace(/\*([^*]+)\*/g, '$1')      // *italic* -> italic
            .replace(/^#{1,6}\s+/gm, '')         // # headings -> plain text
            .replace(/`([^`]+)`/g, '$1');         // `code` -> code

          await prisma.message.create({
            data: {
              chatId: currentChatId!,
              role: 'assistant',
              content: cleanText,
            }
          });
        } catch (err) {
          console.error("Error saving assistant message:", err);
        }
      }
    });

    // useChat expects a UI-message stream, not a plain text stream —
    // this is the fix for the "response appears all at once" / no live streaming bug.
    const response = result.toUIMessageStreamResponse();
    response.headers.set('x-chat-id', currentChatId!);
    response.headers.set('Access-Control-Expose-Headers', 'x-chat-id');
    return response;
  } catch (error: any) {
    console.error('Chat API Error:', error);

    // Provide specific error messages and status codes so the frontend can
    // distinguish between different failure modes and show appropriate UI.
    const message = error?.message || '';
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('rate limit') || lowerMsg.includes('429') || lowerMsg.includes('too many requests')) {
      return NextResponse.json(
        { error: 'The AI model is currently busy due to high demand. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out') || lowerMsg.includes('deadline')) {
      return NextResponse.json(
        { error: 'The response timed out. The model may be under heavy load — please try again.' },
        { status: 504 }
      );
    }

    if (lowerMsg.includes('context length') || lowerMsg.includes('token') || lowerMsg.includes('too long')) {
      return NextResponse.json(
        { error: 'Your message was too long for this model to process. Please try a shorter message.' },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong while generating a response. Please try again.' },
      { status: 500 }
    );
  }
}