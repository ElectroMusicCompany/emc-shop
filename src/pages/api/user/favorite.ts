import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        favorite: true,
      },
    });
    const item = await db.item.findUnique({
      where: {
        id: req.query.itemId as string,
      },
    });
    if (user && item) {
      if (user.favorite.find((f) => f.itemId === item.id)) {
        await db.favorite.deleteMany({
          where: {
            AND: [
              {
                userId: user.id,
              },
              {
                itemId: item.id,
              },
            ]
          },
        });
      } else {
        await db.favorite.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            item: {
              connect: {
                id: item.id,
              },
            },
          },
        });
      }
    }
    res.status(200).json({ status: "success" });
  } else {
    res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
