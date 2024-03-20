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
      }
      res.status(200).json({ status: "success", review });
    } else {
      res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    res.status(403).json({ status: "error", message: "Unauthorized" });
  }
}
