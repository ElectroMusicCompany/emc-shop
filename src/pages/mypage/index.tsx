import Layout from "@/components/Layout";
import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { User } from "@prisma/client";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function MyPage({ user }: { user: User }) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2">マイページ</h3>
        <h4 className="text-lg font-bold py-4">商品管理</h4>
        <Link
          href="/mypage/favorites"
          className="flex items-center justify-between border-y py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>お気に入り一覧</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/mypage/items"
          className="flex items-center justify-between border-b py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>出品した商品</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/mypage/orders"
          className="flex items-center justify-between border-b py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>購入した商品</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <h4 className="text-lg font-bold py-4">設定</h4>
        <Link
          href="/mypage/info"
          className="flex items-center justify-between border-y py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>アカウント情報</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/mypage/profile"
          className="flex items-center justify-between border-b py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>プロフィール設定</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/mypage/addresses"
          className="flex items-center justify-between border-b py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>住所一覧</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/mypage/bank"
          className="flex items-center justify-between border-b py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p>銀行口座設定</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center justify-between border-y mt-8 py-4 w-full duration-150 hover:bg-gray-100"
        >
          <p className="text-sky-500">ログアウト</p>
          <MdOutlineKeyboardArrowRight size={24} />
        </Link>
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
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};
