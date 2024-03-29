import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    let accountId;
    if (!user.stripeId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "JP",
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: `${user.name} EMC Shop`,
          url: "https://emc.wmsci.com",
          mcc: "5734",
          product_description: "CD・DVDなどの音楽メディアの販売を行います。",
        },
        default_currency: "jpy",
      });
      accountId = account.id;
      const origin =
        process.env.NODE_ENV === "development"
          ? `http://${req.headers.host}`
          : `https://${req.headers.host}`;
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/mypage/bank`,
        return_url: `${origin}/mypage/bank`,
        type: "account_onboarding",
      });
      await db.user.update({
        where: { id: user.id },
        data: {
          stripeId: accountId,
        },
      });
      res.status(200).json({ status: "success", url: accountLink.url });
    } else {
      const loginLink = await stripe.accounts.createLoginLink(user.stripeId);
      res.status(200).json({ status: "success", url: loginLink.url });
    }
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return res.status(500).json({ status: "error", error: e.message });
    } else {
      return res
        .status(500)
        .json({ status: "error", error: "An error occurred" });
    }
  }
}
