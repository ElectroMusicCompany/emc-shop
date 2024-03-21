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
  const { userId, sessionId, points } = req.query;
  const user = await db.user.findUnique({
    where: {
      id: userId as string,
    },
  });
  if (user) {
    if (user.suspended) {
      return res
        .status(403)
        .json({ status: "error", message: "Account suspended" });
    }

    if (!userId || !sessionId) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid request" });
    }
    const stripeSession = await stripe.checkout.sessions.retrieve(
      sessionId as string
    );
    console.log(stripeSession);
    if (
      !stripeSession ||
      stripeSession.payment_status !== "paid" ||
      !stripeSession.payment_intent?.toString().startsWith("pi_")
    ) {
      return res
        .status(400)
        .json({ status: "error", error: "Payment not completed" });
    }
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        points: user.points + Number(points),
      },
    });
    await fetch(`${process.env.DISCORD_BOT_WEB_URL}/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DISCORD_BOT_WEB_SECRET}`,
      },
      body: JSON.stringify({
        userId: user.id,
        points: Number(points),
      }),
    });
    return res.redirect(303, `/mypage/points?completed=true&points=${points}`);
  } else {
    return res.status(200).json({ status: "error", error: "User not found" });
  }
}
