import { db } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";
import { add } from "date-fns";
import { getItemImage } from "@/utils/images";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    if (user) {
      const { itemId, buyerId, addressId, sessionId } = req.query;
      if (!itemId || !buyerId || !sessionId) {
        return res.status(400).json({ status: "error", error: "Invalid request" });
      }
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId as string);
      const item = await db.item.findUnique({
        where: {
          id: itemId?.toString(),
        },
        select: {
          id: true,
          price: true,
          name: true,
          stripe: true,
          images: true,
          order: {
            select: {
              id: true,
            },
          },
          user: {
            select: {
              id: true,
            },
          }
        },
      });
      if (!item) {
        return res.status(404).json({ status: "error", error: "Item not found" });
      }
      if (!item.stripe) {
        if (!stripeSession || stripeSession.payment_status !== "paid" || stripeSession.payment_intent !== "succeeded" || stripeSession.amount_total !== item.price) {
          return res.status(400).json({ status: "error", error: "Payment not completed" });
        }
      }
      if (item.order) {
        return res.status(400).json({ status: "error", error: "Item already purchased" });
      }
      const order = await db.order.create({
        data: {
          userId: user.id,
          itemId: item.id,
          addressId: addressId?.toString() || "",
          sessionId: sessionId.toString() || "no-stripe",
          expiresAt: item.stripe ? add(new Date(), { days: 3 }) : null,
        },
      });
      await fetch(`${process.env.DISCORD_BOT_WEB_URL}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DISCORD_BOT_WEB_SECRET}`,
        },
        body: JSON.stringify({
          sellerId: item.user.id,
          buyerId: user.id,
          item: {
            id: item.id,
            name: item.name,
            price: item.price,
            image: getItemImage(item.images[0].id, item.images[0].format)
          },
          order: {
            id: order.id,
            createdAt: order.createdAt,
            expiresAt: item.stripe ? add(order.createdAt, { days: 3 }) : null,
          },
        }),
      })
      return res.redirect(303, `/purchase/complete?itemId=${item.id}&orderId=${order.id}`);
    } else {
      return res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    return res.status(403).json({ status: "error", message: "Unauthorized"});
  }
}
