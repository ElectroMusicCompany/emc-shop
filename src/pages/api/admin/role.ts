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
    const { admin, userId } = req.body;
    const n = await db.user.update({
      data: {
        admin: admin === "true"
      },
      where: {
        id: userId,
      },
    });
    res.status(200).json({ status: "success", address: n });
  } else {
    res.status(405).json({ status: "error", message: "Method not allowed" });
  }
}
