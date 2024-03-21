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

export default function MyPageAddresses({
  user,
}: {
  user: { id: string; points: number };
}) {
  const router = useRouter();
  const { completed, points, canceled } = router.query;
  const buyPoints = async (point: number) => {
    const loading = toast.loading("購入中...");
    const red = await (
      await fetch(`/api/user/payPoint?userId=${user.id}&points=${point}`)
    ).json();
    if (red.status === "success") {
      toast.success("購入しました", {
        id: loading,
      });
      window.location.href = red.redirect;
    } else {
      toast.error("エラーが発生しました", {
        id: loading,
      });
    }
  };
  return (
    <Layout>
      <NextHeadSeo
        title="EMC Point - EMC Shop"
        description="EMC Point"
        canonical={`https://shop.emcmusic.net/mypage/points`}
        og={{
          title: "EMC Point - EMC Shop",
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
          EMC Point
        </h3>
        <div className="py-2">
          {canceled && (
            <div className="bg-red-200 border border-red-500 text-red-700 rounded-md mb-4">
              <div className="max-w-3xl mx-auto p-4">
                <p className="text-sm">購入がキャンセルされました</p>
              </div>
            </div>
          )}
          {completed && points && (
            <div className="bg-green-200 border border-green-500 text-green-700 rounded-md mb-4">
              <div className="max-w-3xl mx-auto p-4">
                <p className="text-sm">{points}pt を購入しました</p>
              </div>
            </div>
          )}
          <p className="text-lg">
            現在のポイント：
            <span className="text-orange-500 font-bold text-2xl">
              {user.points} pt
            </span>
          </p>
          <h4 className="text-lg font-bold py-4">ポイントを購入する</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => buyPoints(500)}
              className="bg-gray-100 text-center p-4 rounded-md duration-150 hover:bg-gray-200"
            >
              500pt
            </button>
            <button
              onClick={() => buyPoints(1000)}
              className="bg-gray-100 text-center p-4 rounded-md duration-150 hover:bg-gray-200"
            >
              1000pt
            </button>
            <button
              onClick={() => buyPoints(2000)}
              className="bg-gray-100 text-center p-4 rounded-md duration-150 hover:bg-gray-200"
            >
              2000pt
            </button>
            <button
              onClick={() => buyPoints(5000)}
              className="bg-gray-100 text-center p-4 rounded-md duration-150 hover:bg-gray-200"
            >
              5000pt
            </button>
            <button
              onClick={() => buyPoints(10000)}
              className="bg-gray-100 text-center p-4 rounded-md duration-150 hover:bg-gray-200"
            >
              10000pt
            </button>
          </div>
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
    select: {
      id: true,
      points: true,
    },
  });
  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};
