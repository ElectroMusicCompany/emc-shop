import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authOptions } from "../auth/[...nextauth]";
import crypto from "crypto";
import formidable from "formidable";
import { db } from "@/lib/prisma";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface fileMimeType {
  [name: string]: string;
}

const FileMimeType: fileMimeType = {
  'image/png': "png",
  'image/jpeg': "jpg",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    const form = formidable();
    const client = new S3Client({ region: "auto", endpoint: process.env.R2_ENDPOINT, credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    }});
    const imageId = crypto.randomUUID();
    form.onPart = part => {
      if (Object.keys(FileMimeType).indexOf(part.mimetype || "") === -1) {
        return
      }
      if (!part.originalFilename || Object.keys(FileMimeType).indexOf(part.mimetype || "") !== -1) {
        form._handlePart(part);
      }
    }
    form.parse(req, async function (err, fields, files: any) {
      const file = files.file[0];
      const format = FileMimeType[file.mimetype];
      const command = new PutObjectCommand({
        Bucket: "emcshop",
        Key: `ITEM_IMAGES/${imageId}.${format}`,
        Body: fs.createReadStream(file.filepath),
        ContentType: file.mimetype,
      });
      await db.image.create({
        data: {
          id: imageId,
          format: format,
        },
      });
      try {
        await client.send(command);
        res.status(200).json({ status: "success", imageId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Internal Server Error" });
      }
      res.status(200).json({ status: "success", imageId });
    });
  } else {
    res.status(401).json({ status: "error", error: "Unauthorized" });
  }
}
