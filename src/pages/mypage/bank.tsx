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
  const getLink = async () => {
    const toastId = toast.loading("リダイレクト中...");
    const res = await fetch("/api/user/connectStripe");
    const data = await res.json();
    if (data.status === "success") {
      toast.success("リダイレクトしました", {
        id: toastId,
      });
      await router.push(data.url);
    }
  };
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          銀行口座設定
        </h3>
        <p>Stripeで販売する場合、この設定が必要です。</p>
        <button
          className="bg-sky-500 text-white rounded-md py-2 mt-4 w-full duration-150 hover:bg-sky-600"
          onClick={() => getLink()}
        >
          {user.stripeId === null ? "銀行口座を登録する" : "口座情報を変更する"}
        </button>
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
