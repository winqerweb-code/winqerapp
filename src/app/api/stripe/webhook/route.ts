import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const storeId = session.client_reference_id;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;

                if (storeId) {
                    await supabase
                        .from("stores")
                        .update({
                            plan_type: "pro",
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            last_usage_date: new Date().toISOString(), // Reset date to now
                            usage_count: 0, // Reset usage on upgrade
                        })
                        .eq("id", storeId);
                    console.log(`Store ${storeId} upgraded to PRO via checkout.`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                // Find store by subscription ID (or customer ID)
                // Since we store subscription_id, we can search by it.
                const { data: stores } = await supabase
                    .from("stores")
                    .select("id")
                    .eq("stripe_subscription_id", subscription.id);

                if (stores && stores.length > 0) {
                    for (const s of stores) {
                        await supabase
                            .from("stores")
                            .update({
                                plan_type: "free",
                                stripe_subscription_id: null,
                            })
                            .eq("id", s.id);
                        console.log(`Store ${s.id} downgraded to FREE via subscription deletion.`);
                    }
                }
                break;
            }

            // Handle payment failure -> maybe downgrade or notify?
            // For now, keep it simple.
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook Logic Error:", error);
        return NextResponse.json(
            { error: "Webhook Handler Failed" },
            { status: 500 }
        );
    }
}
