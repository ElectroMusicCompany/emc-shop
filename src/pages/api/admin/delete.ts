import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { search } from "@/lib/meilisearch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized" });
      }
      const { userId, itemId, reportId, reviewId, orderId } = req.body;
      if (itemId) {
        const n = await db.item.delete({
          where: {
            id: itemId,
          },
        });
        await search.index("es_items").deleteDocument(itemId.toString());
        return res.status(200).json({ status: "success", address: n });
      } else if (reportId) {
        const n = await db.report.delete({
          where: {
            id: reportId,
          },
        });
        return res.status(200).json({ status: "success", address: n });
      } else if (reviewId) {
        const n = await db.review.delete({
          where: {
            id: reviewId,
          },
        });
        return res.status(200).json({ status: "success", address: n });
      } else if (orderId) {
        const n = await db.order.delete({
          where: {
            id: orderId,
          },
        });
        await search.index("es_items").updateDocuments([
          {
            id: n.itemId,
            order: false,
          },
        ]);
        return res.status(200).json({ status: "success", address: n });
      } else if (userId) {
        const n = await db.user.update({
          where: {
            id: userId,
          },
          data: {
            suspended: true,
          },
        });
        await search.index("es_items").deleteDocuments({
          filter: `userId = ${userId}`,
        })
        return res.status(200).json({ status: "success", address: n });
      } else {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid request" });
      }
    } else {
      res.status(405).json({ status: "error", message: "Method not allowed" });
    }
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return res.status(500).json({ status: "error", message: e.message });
    }
    res.status(500).json({ status: "error", message: "An error occurred" });
  }
}
