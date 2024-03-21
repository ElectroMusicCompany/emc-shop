import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    const { itemId, buyerId, addressId } = req.query;
    const item = await db.item.findUnique({
      where: {
        id: itemId?.toString(),
      },
      include: {
        images: true,
        user: true
      },
    });
    if (!item) {
      return res.status(404).json({ status: "error", error: "Item not found" });
    }
    if (!item.stripe) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: item.name,
                images: [`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${item.images[0].id}.${item.images[0].format}`],
              },
              unit_amount: item.price,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          transfer_data: {
            destination: item.user.stripeId || "",
          },
        },
        locale: "ja",
        mode: "payment",
        success_url: `https://emc.wmsci.com/api/item/callback?itemId=${itemId}&buyerId=${buyerId}&addressId=${addressId}&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://emc.wmsci.com/purchase/${itemId}?canceled=true`,
      });
      return res.status(303).json({ status: "success", redirect: session.url || "" });
    } else {
      return res.status(303).json({ status: "success", redirect: `/api/item/callback?itemId=${itemId}&buyerId=${buyerId}&addressId=${addressId}` });
    }
  } else {
    return res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
