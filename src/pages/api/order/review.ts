import { db } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
      const order = await db.order.findUnique({
        where: {
          id: req.body.orderId as string,
        },
        include: {
          item: {
            include: {
              images: true,
            },
          }
        }
      });
      if (!order) {
        return res
          .status(404)
          .json({ status: "error", error: "Order not found" });
      }
      const review = await db.review.create({
        data: {
          userId: user.id,
          itemId: req.body.itemId as string,
          text: req.body.text as string,
          rating: req.body.rating as boolean,
        },
      });
      if (order.shipped) {
        await db.order.update({
          data: {
            complete: true,
          },
          where: {
            id: req.body.orderId as string,
          },
        });
      } else {
        await db.order.update({
          data: {
            shipped: true,
          },
          where: {
            id: req.body.orderId as string,
          },
        });
        await fetch(`${process.env.DISCORD_BOT_WEB_URL}/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DISCORD_BOT_WEB_SECRET}`,
          },
          body: JSON.stringify({
            userId: order.item.userId,
            item: {
              id: order.itemId,
              name: order.item.name,
              price: order.item.price,
              image: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${order.item.images[0].id}.${order.item.images[0].format}`
            },
            order: {
              id: order.id,
              createdAt: order.createdAt,
            },
          }),
        })
      }
      res.status(200).json({ status: "success", review });
    } else {
      res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    res.status(403).json({ status: "error", message: "Unauthorized" });
  }
}
