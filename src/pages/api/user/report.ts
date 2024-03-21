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
      const { itemId, orderId, text } = req.body;
      if (!itemId && !orderId) {
        return res
          .status(400)
          .json({ status: "error", error: "Invalid request" });
      }
      if (!text) {
        return res
          .status(400)
          .json({ status: "error", error: "Please provide a reason" });
      }
      if (itemId) {
        const item = await db.item.findUnique({
          where: {
            id: itemId as string,
          },
        });
        if (!item) {
          return res
            .status(404)
            .json({ status: "error", error: "Item not found" });
        }
        const report = await db.report.create({
          data: {
            text: text,
            userId: user.id,
            itemId: itemId as string,
          },
        });
        res.status(200).json({ status: "success", report });
      } else {
        const order = await db.order.findUnique({
          where: {
            id: orderId as string,
          },
        });
        if (!order) {
          return res
            .status(404)
            .json({ status: "error", error: "Order not found" });
        }
        const report = await db.report.create({
          data: {
            text: text,
            userId: user.id,
            orderId: orderId as string,
          },
        });
        res.status(200).json({ status: "success", report });
      }
    } else {
      res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    res.status(403).json({ status: "error", message: "Unauthorized" });
  }
}
