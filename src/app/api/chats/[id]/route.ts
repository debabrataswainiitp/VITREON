import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const email = user.emailAddresses[0]?.emailAddress;
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chat = await prisma.chat.findUnique({
      where: { id: id, userId: dbUser.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        }
      }
    });

    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

    return NextResponse.json(chat);
  } catch (error: any) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const email = user.emailAddresses[0]?.emailAddress;
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Validate ownership
    const chat = await prisma.chat.findUnique({
      where: { id: id, userId: dbUser.id },
    });

    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

    await prisma.chat.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
