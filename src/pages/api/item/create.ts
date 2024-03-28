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
    if (!user) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
    if (user.suspended) {
      return res.status(403).json({ status: "error", message: "Account suspended" });
    }
    if (req.body.itemId) {
      const item = await db.item.update({
        where: {
          id: req.body.itemId,
        },
        data: {
          name: req.body.name,
          description: req.body.description,
          state: req.body.state,
          shipping:
            req.body.shipping === "その他" ? req.body.shipping_other! : req.body.shipping,
          deliveryDays: req.body.deliveryDays,
          stripe: req.body.stripe,
          price: Number(req.body.price),
          user: {
            connect: {
              id: session?.user?.id,
            },
          },
        },
      });
      for (const mediaId of req.body.images) {
        await db.image.update({
          where: {
            id: mediaId,
          },
          data: {
            item: {
              connect: {
                id: item.id,
              },
            },
          },
        });
      }
      res.status(200).json({ status: "success", itemId: item.id});
    } else {
      const item = await db.item.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          state: req.body.state,
          shipping:
            req.body.shipping === "その他" ? req.body.shipping_other! : req.body.shipping,
          deliveryDays: req.body.deliveryDays,
          stripe: req.body.stripe,
          price: Number(req.body.price),
          user: {
            connect: {
              id: session?.user?.id,
            },
          },
        },
      });
      for (const mediaId of req.body.images) {
        await db.image.update({
          where: {
            id: mediaId,
          },
          data: {
            item: {
              connect: {
                id: item.id,
              },
            },
          },
        });
      }
      res.status(200).json({ status: "success", itemId: item.id});
    }
  } else {
    res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
