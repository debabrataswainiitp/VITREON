import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { currentUser } from '@clerk/nextjs/server';

const PACK_PRICES: Record<string, number> = { spark: 199, surge: 799, flood: 2999 };
const SUB_PRICES: Record<string, number> = { pro: 999, team: 4999 };

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packId, isSub } = await req.json();
    const priceMap = isSub ? SUB_PRICES : PACK_PRICES;
    const amount = priceMap[packId];

    if (!amount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const keysConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (!keysConfigured && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Payment processing is not configured.' },
        { status: 503 }
      );
    }

    if (!keysConfigured) {
      return NextResponse.json({
        id: "order_mock_" + Math.random().toString(36).slice(2),
        amount: amount * 100,
        currency: "INR",
        mock: true,
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).slice(2),
      notes: { packId, isSub: String(!!isSub), clerkUserId: user.id },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
