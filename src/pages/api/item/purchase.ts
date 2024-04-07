import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/lib/prisma";
import { getItemImage } from "@/utils/images";
import { search } from "@/lib/meilisearch";

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
      const { itemId, buyerId, addressId } = req.query;
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
          user: {
            select: {
              id: true,
              stripeId: true,
            },
          },
        },
      });
      if (!item) {
        return res
          .status(404)
          .json({ status: "error", error: "Item not found" });
      }
      await search.index("es_items").updateDocuments([
        {
          id: item.id,
          order: true,
        },
      ]);
      if (!item.stripe) {
        const stripeSession = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "jpy",
                product_data: {
                  name: item.name,
                  images: [
                    getItemImage(item.images[0].id, item.images[0].format),
                  ],
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
          success_url: `https://shop.emcmusic.net/api/item/callback?itemId=${itemId}&buyerId=${buyerId}&addressId=${addressId}&sessionId={CHECKOUT_SESSION_ID}`,
          cancel_url: `https://shop.emcmusic.net/purchase/${itemId}?canceled=true`,
        });
        return res
          .status(303)
          .json({ status: "success", redirect: session.url || "" });
      } else {
        return res
          .status(303)
          .json({
            status: "success",
            redirect: `/api/item/callback?itemId=${itemId}&buyerId=${buyerId}&addressId=${addressId}`,
          });
      }
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
