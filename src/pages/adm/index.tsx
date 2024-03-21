import AdminLayout from "@/components/admin/AdminLayout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { db } from "@/lib/prisma";
import NextHeadSeo from "next-head-seo";
import AdminCard from "@/components/admin/AdminCard";
import getConfig from "next/config";

export default function AdminPage({
  userCount,
  itemCount,
  orderCount,
  reportCount,
  latestVersion,
}: {
  userCount: number;
  itemCount: number;
  orderCount: number;
  reportCount: number;
  latestVersion: string;
}) {
  const { publicRuntimeConfig } = getConfig();
  const version = publicRuntimeConfig?.version;
  return (
    <AdminLayout url="index">
      <NextHeadSeo title="EMC Shop Admin" />
      <h2 className="text-2xl font-bold">管理画面</h2>
      <div className="my-8 flex gap-4">
        <AdminCard title="バージョン情報">
          <p>最新：{latestVersion}</p>
          <p>現在：{version}</p>
        </AdminCard>
        <AdminCard title="統計">
          <p>ユーザー数：{userCount}</p>
          <p>出品数：{itemCount}</p>
          <p>注文数：{orderCount}</p>
          <p>通報数：{reportCount}</p>
        </AdminCard>
      </div>
    </AdminLayout>
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
    where: {
      id: session.user.id,
    },
  });
  if (!user?.admin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const latestPackage = await (
    await fetch(
      "https://raw.githubusercontent.com/ElectroMusicCompany/emc-shop/main/package.json"
    )
  ).json();
  const userCount = await db.user.count();
  const itemCount = await db.item.count();
  const orderCount = await db.order.count();
  const reportCount = await db.report.count();
  return {
    props: {
      userCount,
      itemCount,
      orderCount,
      reportCount,
      latestVersion: latestPackage.version,
    },
  };
};
