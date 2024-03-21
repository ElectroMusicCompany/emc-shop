import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  if (req.method === "POST") {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    if (!user?.admin) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { itemId, reportId, orderId } = req.body;
    if (itemId) {
      const n = await db.item.delete({
        where: {
          id: itemId,
        },
      });
      return res.status(200).json({ status: "success", address: n });
    } else if (reportId) {
      const n = await db.report.delete({
        where: {
          id: reportId,
        },
      });
      return res.status(200).json({ status: "success", address: n });
    } else if (orderId) {
      const n = await db.order.delete({
        where: {
          id: orderId,
        },
      });
      return res.status(200).json({ status: "success", address: n });
    } else {
      return res.status(400).json({ status: "error", message: "Invalid request" });
    }
  } else {
    res.status(405).json({ status: "error", message: "Method not allowed" });
  }
}
