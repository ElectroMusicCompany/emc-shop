import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authOptions } from "../auth/[...nextauth]";
import crypto from "crypto";
import formidable from "formidable";
import { db } from "@/lib/prisma";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface fileMimeType {
  [name: string]: string;
}

const FileMimeType: fileMimeType = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

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
      if (!user) {
        return res.status(401).json({ status: "error", error: "Unauthorized" });
      }
      if (user.suspended) {
        return res
          .status(403)
          .json({ status: "error", message: "Account suspended" });
      }
      const form = formidable();
      const client = new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      });
      const imageId = crypto.randomUUID();
      form.onPart = (part) => {
        if (Object.keys(FileMimeType).indexOf(part.mimetype || "") === -1) {
          return;
        }
        if (
          !part.originalFilename ||
          Object.keys(FileMimeType).indexOf(part.mimetype || "") !== -1
        ) {
          form._handlePart(part);
        }
      };
      form.parse(req, async function (err, fields, files: any) {
        const file = files.file[0];
        let image: Buffer;
        const sharpened = sharp(file.filepath);
        const meta = await sharpened.metadata();
        if (meta.width! >= meta.height!) {
          sharpened.resize(1024, null);
        } else {
          sharpened.resize(null, 1024);
        }
        image = await sharpened.toFormat("jpeg").toBuffer();
        const command = new PutObjectCommand({
          Bucket: "emcshop",
          Key: `ITEM_IMAGES/${imageId}.jpg`,
          Body: image,
          ContentType: file.mimetype,
        });
        await db.image.create({
          data: {
            id: imageId,
            format: "jpg",
          },
        });
        try {
          await client.send(command);
          res.status(200).json({ status: "success", imageId });
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ status: "error", error: "Internal Server Error" });
        }
        res.status(200).json({ status: "success", imageId });
      });
    } else {
      res.status(401).json({ status: "error", error: "Unauthorized" });
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
