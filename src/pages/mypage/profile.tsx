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
import NextHeadSeo from "next-head-seo";

export default function MyPageAddresses({ user }: { user: User }) {
  const router = useRouter();
  const [desc, setDesc] = useState(user.description);
  const onSubmit = async () => {
    const loading = toast.loading("保存中...");
    const res = await fetch("/api/user/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ desc }),
    });
    const data = await res.json();
    if (data.status === "success") {
      toast.success("保存しました", {
        id: loading,
      });
    } else {
      toast.error("エラーが発生しました", {
        id: loading,
      });
    }
  };
  return (
    <Layout>
      <NextHeadSeo
        title="プロフィール設定 - EMC Shop"
        description="プロフィール設定"
        canonical={`https://shop.emcmusic.net/mypage/profile`}
        og={{
          title: "プロフィール設定 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          プロフィール設定
        </h3>
        <div className="py-4">
          <label className="block font-medium text-gray-700" htmlFor="desc">
            説明
          </label>
          <p className="text-sm text-gray-500">
            Markdownの一部記法が使えます。
          </p>
          <div className="mt-1">
            <textarea
              id="desc"
              className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={5}
              value={desc || ""}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
          </div>
          <button
            className="bg-sky-500 text-white rounded-md py-2 mt-4 w-full duration-150 hover:bg-sky-600"
            onClick={() => onSubmit()}
          >
            保存する
          </button>
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
