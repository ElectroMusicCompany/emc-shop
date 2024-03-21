import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { User } from "@prisma/client";
import Layout from "@/components/Layout";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import NextHeadSeo from "next-head-seo";
import Link from "next/link";

export default function MyPageAddresses({
  user,
}: {
  user: {
    id: string;
    stripeId: string | null;
  };
}) {
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
      <NextHeadSeo
        title="銀行口座設定 - EMC Shop"
        description="銀行口座設定 / 本人確認"
        canonical={`https://shop.emcmusic.net/mypage/bank`}
        og={{
          title: "銀行口座設定 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <Link href="/mypage">
            <IoMdArrowBack size={24} />
          </Link>
          銀行口座設定 / 本人確認
        </h3>
        <p>Stripeで販売する場合、この設定が必要です。</p>
        <p className="text-red-500">※18歳未満は利用できません</p>
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
    select: {
      id: true,
      stripeId: true,
    },
  });
  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};
