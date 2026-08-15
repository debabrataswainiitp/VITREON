import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock, packId, amount, isSub } = await req.json();

    if (!isMock) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) throw new Error("Missing Razorpay Secret");

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }
    }

    // Update DB with successful order/credits
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
          }
        });

        if (dbUser) {
          if (isSub) {
            let subCredits = 300;
            if (packId === "pro") subCredits = 2000;
            else if (packId === "team") subCredits = 999999;

            await prisma.$transaction([
              prisma.subscription.create({
                data: {
                  userId: dbUser.id,
                  razorpayId: isMock ? `mock_${Math.random()}` : razorpay_payment_id,
                  plan: packId || "Pro",
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
              }),
              prisma.user.update({
                where: { id: dbUser.id },
                data: { subscriptionCredits: subCredits }
              })
            ]);
          } else {
            // Packs
            let creditsToAdd = 0;
            if (packId === "spark") creditsToAdd = 200;
            else if (packId === "surge") creditsToAdd = 1000;
            else if (packId === "flood") creditsToAdd = 5000;
            else creditsToAdd = 100;

            await prisma.user.update({
              where: { id: dbUser.id },
              data: { credits: (dbUser.credits || 0) + creditsToAdd }
            });
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
