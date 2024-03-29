import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/lib/prisma";
import { getItemImage } from "@/utils/images";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
      const user = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
      if (!user) {
        return res.status(401).json({ status: "error", error: "Unauthorized" });
      }
      if (user.suspended) {
        return res
          .status(403)
          .json({ status: "error", message: "Account suspended" });
      }
      const { points } = req.query;
      const stripeSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: `EMC Point ${points}pt`,
              },
              unit_amount: Number(points?.toString() || 0),
            },
            quantity: 1,
          },
        ],
        locale: "ja",
        mode: "payment",
        success_url: `https://shop.emcmusic.net/api/user/callbackPoint?userId=${user.id}&points=${points}&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://shop.emcmusic.net/mypage/points?canceled=true`,
      });
      return res
        .status(303)
        .json({ status: "success", redirect: stripeSession.url || "" });
    } else {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return res.status(500).json({ status: "error", error: e.message });
    }
    return res
      .status(500)
      .json({ status: "error", error: "An error occurred" });
  }
}
