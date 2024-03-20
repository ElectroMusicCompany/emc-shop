import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { User } from "@prisma/client";
import Layout from "@/components/Layout";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MyPageAddresses({ user }: { user: User }) {
  const router = useRouter();
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          アカウント情報
        </h3>
        <div className="py-2">
          <h3 className="text-lg font-bold py-2">ユーザーID</h3>
          <p>{user.id}</p>
        </div>
        <div className="py-2">
          <h3 className="text-lg font-bold py-2">ユーザー名</h3>
          <p>{user.name}</p>
        </div>
        <div className="py-2">
          <h3 className="text-lg font-bold py-2">Stripe 連携</h3>
          <p>{user.stripeId === null ? "未連携" : "連携済み"}</p>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};
