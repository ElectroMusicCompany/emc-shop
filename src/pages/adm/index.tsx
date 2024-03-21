import AdminLayout from "@/components/admin/AdminLayout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { db } from "@/lib/prisma";
import NextHeadSeo from "next-head-seo";

export default function AdminPage() {
  return (
    <AdminLayout url="index">
      <NextHeadSeo title="EMC Shop Admin" />
      <h2 className="text-2xl font-bold">管理画面</h2>
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
  return {
    props: {},
  };
};
