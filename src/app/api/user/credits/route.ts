import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ credits: 0 }, { status: 401 });

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ credits: 0 }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ 
      where: { email },
      include: {
        subscriptions: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!dbUser) return NextResponse.json({ credits: 100, subscriptionCredits: 0, plan: null });

    const activeSub = dbUser.subscriptions[0];
    let planName = null;
    if (activeSub) {
      planName = activeSub.plan.charAt(0).toUpperCase() + activeSub.plan.slice(1);
    }

    return NextResponse.json({ 
      credits: dbUser.credits,
      subscriptionCredits: dbUser.subscriptionCredits,
      plan: planName
    });
  } catch (error) {
    return NextResponse.json({ credits: 0 }, { status: 500 });
  }
}
