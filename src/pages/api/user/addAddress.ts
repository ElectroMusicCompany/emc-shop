import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";

type AddressData = {
  zip: string;
  state: string;
  city: string;
  street: string;
  building?: string;
  phone: string;
  lastName: string;
  firstName: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  if (req.method === "POST") {
    const { zip, state, city, street, building, phone, lastName, firstName } = req.body;
    const data: AddressData = {
      zip,
      state,
      city,
      street,
      phone,
      lastName,
      firstName,
    };
    if (building) {
      data.building = building;
    }
    const n = await db.address.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });
    res.status(200).json({ status: "success", address: n });
  } else {
    res.status(405).json({ status: "error", message: "Method not allowed" });
  }
}
