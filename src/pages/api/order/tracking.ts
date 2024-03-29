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
      if (user) {
        const tracking = await db.order.update({
          where: {
            id: req.body.orderId as string,
          },
          data: {
            tracking: req.body.tracking as string,
          },
        });
        res.status(200).json({ status: "success", tracking });
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
