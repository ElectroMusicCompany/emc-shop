import { db } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
      const order = await db.order.findUnique({
        where: {
          id: req.body.orderId as string,
        },
        select: {
          item: true,
        },
      });
      if (user && order?.item.userId === user.id) {
        await db.order.update({
          where: {
            id: req.body.orderId as string,
          },
          data: {
            expiresAt: null,
          },
        });
        res.status(200).json({ status: "success" });
      } else {
        res.status(200).json({ status: "error", error: "User not found" });
      }
    } else {
      res.status(403).json({ status: "error", message: "Unauthorized" });
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
