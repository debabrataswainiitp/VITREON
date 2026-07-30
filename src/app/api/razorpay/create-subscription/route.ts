import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { planId, cycle } = await req.json();

    // In a real implementation, you'd map your planId to a Razorpay Plan ID
    // created in the Razorpay dashboard.
    // e.g., const razorpayPlanId = planMapping[planId][cycle];

    // Initialize razorpay
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock mode for demonstration if keys are missing
      return NextResponse.json({
        id: "sub_mock_" + Math.random().toString(36).substring(7),
        status: "created",
        plan_id: "plan_mock_123",
        mock: true
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await instance.subscriptions.create({
      plan_id: "plan_dummy_replace_me", // MUST BE REAL PLAN ID
      customer_notify: 1,
      total_count: 12,
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
