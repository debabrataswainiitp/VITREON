import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'Email not found' }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chats = await prisma.chat.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
