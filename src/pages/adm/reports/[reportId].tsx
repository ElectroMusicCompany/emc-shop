import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import NextHeadSeo from "next-head-seo";

export default function AdminReports() {
  return (
    <AdminLayout url="report">
      <NextHeadSeo title="通報 - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">通報</h2>
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
