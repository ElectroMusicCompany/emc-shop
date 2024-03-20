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
    if (req.body.id) {
      const before = await db.item.findUnique({
        where: {
          id: req.body.id,
        },
      });
      if (before?.userId !== session.user.id) {
        return res.status(401).json({ status: "error", error: "Unauthorized" });
      }
      const item = await db.item.delete({
        where: {
          id: req.body.id,
        },
      });
      res.status(200).json({ status: "success", itemId: item.id});
    } else {
      res.status(400).json({ status: "error", error: "Missing id" });
    }
  } else {
    res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
