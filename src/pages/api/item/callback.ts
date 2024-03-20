import { db } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";

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
      //const stripeSession = await stripe.checkout.sessions.retrieve(sessionId as string);
      const item = await db.item.findUnique({
        where: {
          id: itemId?.toString(),
        },
        include: {
          images: true,
          order: true,
        },
      });
      if (!item) {
        return res.status(404).json({ status: "error", error: "Item not found" });
      }
      /*if (!stripeSession || stripeSession.payment_status !== "paid" || stripeSession.payment_intent !== "succeeded" || stripeSession.amount_total !== item.price) {
        return res.status(400).json({ status: "error", error: "Payment not completed" });
      }*/
      if (item.order) {
        return res.status(400).json({ status: "error", error: "Item already purchased" });
      }
      const order = await db.order.create({
        data: {
          userId: user.id,
          itemId: item.id,
          addressId: addressId?.toString() || "",
          sessionId: "a",
        },
      });
      return res.redirect(303, `/purchase/complete?itemId=${item.id}&orderId=${order.id}`);
    } else {
      return res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    return res.status(403).json({ status: "error", message: "Unauthorized"});
  }
}
