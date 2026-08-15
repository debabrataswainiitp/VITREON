import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
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
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Upsert user in our DB (single round trip)
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
      }
    });

    const { messages, agent = 'prism', chatId, model = 'nvidia/nemotron-3.5-lightning:free' } = await req.json();

    const systemPrompt = MASTER_PROMPTS[agent as AgentId] || MASTER_PROMPTS.prism;

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const lastMessage = messages[messages.length - 1];
    
    let messageText = '';
    if (lastMessage) {
      if (typeof lastMessage.content === 'string') {
        messageText = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        messageText = lastMessage.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n');
      } else if (Array.isArray(lastMessage.parts)) {
        messageText = lastMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n');
      }
    }

    let currentChatId = chatId;
    if (!currentChatId) {
      const chat = await prisma.chat.create({
        data: {
          userId: dbUser.id,
          title: messageText.substring(0, 50) || 'New Chat',
        }
      });
      currentChatId = chat.id;
    }

    // Check Credits
    if (dbUser.subscriptionCredits <= 0 && dbUser.credits <= 0) {
      return NextResponse.json({ error: 'You have run out of credits. Please recharge or upgrade your subscription.' }, { status: 402 });
    }

    // Deduct credits
    if (dbUser.subscriptionCredits > 0) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { subscriptionCredits: { decrement: 1 } }
      });
    } else {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { credits: { decrement: 1 } }
      });
    }

    if (lastMessage) {
      // Fire and forget user message to reduce Time-To-First-Token
      prisma.message.create({
        data: {
          chatId: currentChatId,
          role: lastMessage.role || 'user',
          content: messageText,
        }
      }).catch(err => console.error("Error saving user message:", err));
    }

    const coreMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: typeof msg.content === 'string' 
        ? msg.content 
        : (Array.isArray(msg.content) ? msg.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n') 
        : (Array.isArray(msg.parts) ? msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n') : ''))
    }));

    const result = streamText({
      model: openrouter(model),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: async ({ text }) => {
        try {
          await prisma.message.create({
            data: {
              chatId: currentChatId,
              role: 'assistant',
              content: text,
            }
          });
        } catch (err) {
          console.error("Error saving assistant message:", err);
        }
      }
    });

    return result.toTextStreamResponse({
      headers: {
        'x-chat-id': currentChatId
      }
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during chat processing' },
      { status: 500 }
    );
  }
}
