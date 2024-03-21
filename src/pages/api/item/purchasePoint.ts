import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/lib/prisma";
import { getItemImage } from "@/utils/images";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const purchase = async (
  user: {
    id: string;
    points: number;
  },
  item: {
    price: number;
    id: string;
    name: string;
    images: {
      id: string;
      format: string;
    }[];
    user: {
      id: string;
    };
  },
  addressId: string
) => {
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      points: user.points - item.price,
    },
  });
  await db.user.update({
    where: {
      id: item.user.id,
    },
    data: {
      points: {
        increment: item.price,
      },
    },
  });
  const order = await db.order.create({
    data: {
      userId: user.id,
      itemId: item.id,
      addressId: addressId?.toString() || "",
      sessionId: "emc-point",
    },
  });
  await fetch(`${process.env.DISCORD_BOT_WEB_URL}/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DISCORD_BOT_WEB_SECRET}`,
    },
    body: JSON.stringify({
      sellerId: item.user.id,
      buyerId: user.id,
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: getItemImage(item.images[0].id, item.images[0].format),
      },
      order: {
        id: order.id,
        createdAt: order.createdAt,
      },
    }),
  });
  return order;
};

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
        points: true,
        user: {
          select: {
            id: true,
            stripeId: true,
          },
        },
      },
    });
    if (!item) {
      return res.status(404).json({ status: "error", error: "Item not found" });
    }
    if (!item.points) {
      return res
        .status(403)
        .json({ status: "error", error: "Item not available for purchase" });
    }
    if (!item.stripe) {
      if (item.price > user.points) {
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
                unit_amount: item.price - user.points,
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
          success_url: `https://shop.emcmusic.net/api/item/callback?itemId=${itemId}&buyerId=${buyerId}&addressId=${addressId}&points=${user.points}&sessionId={CHECKOUT_SESSION_ID}`,
          cancel_url: `https://shop.emcmusic.net/purchase/${itemId}?canceled=true`,
        });
        return res
          .status(303)
          .json({ status: "success", redirect: session.url || "" });
      } else {
        const order = await purchase(user, item, addressId as string);
        return res
          .status(303)
          .json({
            status: "success",
            redirect: `/purchase/complete?itemId=${item.id}&orderId=${order.id}`,
          });
      }
    } else {
      if (item.price > user.points) {
        return res
          .status(403)
          .json({ status: "error", error: "Insufficient points" });
      }
      const order = await purchase(user, item, addressId as string);
      return res
        .status(303)
        .json({
          status: "success",
          redirect: `/purchase/complete?itemId=${item.id}&orderId=${order.id}`,
        });
    }
  } else {
    return res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
