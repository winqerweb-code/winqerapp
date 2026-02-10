import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStore } from "@/app/actions/store";

export async function POST(req: NextRequest) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: "Stripe Secret Key is missing" },
            { status: 500 }
        );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: '2023-10-16', // Removing to avoid type mismatch with v20+ SDK
    });

    try {
        const body = await req.json();
        const { storeId, priceId } = body;

        if (!storeId || !priceId) {
            return NextResponse.json(
                { error: "Missing storeId or priceId" },
                { status: 400 }
            );
        }

        // Verify Store Access (Optional but recommended, though middleware/actions usually handle this)
        const storeRes = await getStore(storeId);
        if (!storeRes.success || !storeRes.store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const store = storeRes.store;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/dashboard/stores/${storeId}?upgrade=success`,
            cancel_url: `${req.nextUrl.origin}/dashboard/stores/${storeId}?upgrade=cancel`,
            client_reference_id: storeId,
            customer_email: undefined, // Let Stripe collect it, or pass user email if available
            subscription_data: {
                metadata: {
                    storeId: storeId,
                },
            },
            metadata: {
                storeId: storeId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
