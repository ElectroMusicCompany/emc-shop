import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    if (req.method === "DELETE") {
      const n = await db.address.findUnique({
        where: {
          id: req.body.id as string,
        },
      });
      if (!n) {
        return res.status(404).json({ status: "error", message: "Not found" });
      }
      if (n.userId !== session.user.id) {
        return res.status(403).json({ status: "error", message: "Forbidden" });
      }
      await db.address.delete({
        where: {
          id: req.body.id as string,
        },
      });
      res.status(200).json({ status: "success" });
    } else {
      res.status(405).json({ status: "error", message: "Method not allowed" });
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
