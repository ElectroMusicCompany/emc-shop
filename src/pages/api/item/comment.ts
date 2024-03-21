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
      if (user.suspended) {
        return res.status(403).json({ status: "error", message: "Account suspended" });
      }
      const comment = await db.comment.create({
        data: {
          userId: user.id,
          itemId: req.body.itemId as string,
          text: req.body.text as string,
        },
      });
      res.status(200).json({ status: "success", comment });
    } else {
      res.status(200).json({ status: "error", error: "User not found" });
    }
  } else {
    res.status(403).json({ status: "error", message: "Unauthorized"});
  }
}
