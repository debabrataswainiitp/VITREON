import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    // B3: Auth check at the very top — before any Razorpay logic
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // B1: Destructure packId/isSub from the same req.json() call (no req.clone())
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packId: bodyPackId,
      isSub: bodyIsSub,
    } = await req.json();

    const keysConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (!keysConfigured && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Payment processing is not configured.' },
        { status: 503 }
      );
    }

    let packId: string | undefined;
    let isSub: boolean = false;

    if (!keysConfigured) {
      // Dev-only mock path — only reachable when Razorpay isn't configured server-side
      if (!razorpay_order_id?.startsWith('order_mock_')) {
        return NextResponse.json({ success: false, message: 'Invalid mock order' }, { status: 400 });
      }
      packId = bodyPackId;
      isSub = !!bodyIsSub;
    } else {
      // Production path — verify Razorpay signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      }

      // Fetch the order from Razorpay to get the authoritative packId/isSub
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
      const order = await instance.orders.fetch(razorpay_order_id);
      packId = order.notes?.packId as string;
      isSub = order.notes?.isSub === 'true';

      if (!packId) {
        return NextResponse.json({ success: false, message: 'Order missing plan data' }, { status: 400 });
      }

      // B4: Verify order ownership — the order must belong to the current user
      if (order.notes?.clerkUserId !== user.id) {
        return NextResponse.json({ success: false, message: 'Order does not belong to this user' }, { status: 403 });
      }
    }

    // B5: Reject unknown packId instead of silently granting 100 credits
    const VALID_PACKS = ['spark', 'surge', 'flood'];
    const VALID_SUBS = ['pro', 'team'];
    if (isSub ? !VALID_SUBS.includes(packId!) : !VALID_PACKS.includes(packId!)) {
      return NextResponse.json({ success: false, message: 'Invalid plan ID' }, { status: 400 });
    }

    // Update DB with successful order/credits
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
      }
    });

    // B2/B6: Replay protection — claim the order atomically before granting anything
    try {
      await prisma.processedPayment.create({
        data: { razorpayOrderId: razorpay_order_id, userId: dbUser.id },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return NextResponse.json(
          { success: false, message: 'This payment has already been processed.' },
          { status: 409 }
        );
      }
      throw e;
    }

    // Grant credits/subscription now that we've claimed the order
    if (isSub) {
      let subCredits = 300;
      if (packId === "pro") subCredits = 2000;
      else if (packId === "team") subCredits = 999999;

      await prisma.$transaction([
        prisma.subscription.create({
          data: {
            userId: dbUser.id,
            razorpayId: keysConfigured ? razorpay_payment_id : `mock_${Math.random()}`,
            plan: packId!,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }),
        prisma.user.update({
          where: { id: dbUser.id },
          data: { subscriptionCredits: { increment: subCredits } }
        })
      ]);
    } else {
      // Packs
      let creditsToAdd = 0;
      if (packId === "spark") creditsToAdd = 200;
      else if (packId === "surge") creditsToAdd = 1000;
      else if (packId === "flood") creditsToAdd = 5000;

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { credits: { increment: creditsToAdd } }
      });
    }
    
    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
