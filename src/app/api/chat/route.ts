import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { AgentId } from '@/store/useAppStore';

export const maxDuration = 30;

export const MASTER_PROMPTS: Record<AgentId, string> = {
  prism: "You are Prism, the central orchestrator and general advanced AI assistant by Vitreon. You are highly capable at general coding, architecture, and routing users to specific solutions.",
  lucent: "You are Lucent, a research & knowledge agent for Vitreon. You excel at finding information, synthesizing complex research papers, web search insights, and summarization.",
  refract: "You are Refract, a deeply technical code agent for Vitreon. You specialize in writing robust code, debugging complex issues, algorithms, and strict performance optimizations.",
  spectrum: "You are Spectrum, a creative and content-focused agent for Vitreon. You specialize in ideation, writing creative copy, storytelling, and UI/UX design concepts.",
  facet: "You are Facet, a data & analysis agent for Vitreon. You specialize in interpreting structured data, generating charts, statistical reasoning, and data engineering.",
  echo: "You are Echo, a memory and context agent for Vitreon. You specialize in recalling past context, summarizing long conversations, and helping manage the user's history."
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

    const result = streamText({
      model: openrouter(model),
      system: systemPrompt,
      // Official SDK converter — replaces the old manual coreMessages mapping
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        try {
          await prisma.message.create({
            data: {
              chatId: currentChatId!,
              role: 'assistant',
              content: text,
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
    return NextResponse.json(
      { error: error.message || 'An error occurred during chat processing' },
      { status: 500 }
    );
  }
}