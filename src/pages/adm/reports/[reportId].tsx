import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import NextHeadSeo from "next-head-seo";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { Report } from "@prisma/client";
import { format } from "date-fns";
import { useEffect } from "react";

export default function AdminReports({ report }: { report: Report }) {
  const { register, handleSubmit, watch, setValue } = useForm<Report>();
  const deleteReport = async () => {
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: report.id,
      }),
    });
    const d = await res.json();
    if (d.status === "success") {
      window.location.href = "/adm/reports";
    }
  };
  useEffect(() => {
    setValue("text", report.text);
    setValue("userId", report.userId);
    setValue("itemId", report.itemId);
    setValue("orderId", report.orderId);
    setValue("createdAt", report.createdAt);
  });
  return (
    <AdminLayout url="report">
      <NextHeadSeo title={`${report.id} - 通報 - EMC Shop Admin`} />
      <h2 className="text-2xl font-bold">通報 - {report.id}</h2>
      <form className="w-full max-w-xl my-2">
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              理由
            </label>
            <textarea
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="text"
              placeholder="text"
              rows={5}
              disabled
              {...register("text")}
            ></textarea>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="userId"
            >
              ユーザーID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="userId"
              type="text"
              placeholder="uid"
              disabled
              {...register("userId")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="itemId"
            >
              商品ID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="itemId"
              type="text"
              placeholder="itemId"
              disabled
              {...register("itemId")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="orderId"
            >
              取引ID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="orderId"
              type="text"
              placeholder="orderId"
              disabled
              {...register("orderId")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="createdAt"
            >
              作成日
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="itemId"
              type="text"
              placeholder="createdAt"
              value={format(report.createdAt, "yyyy-MM-dd HH:mm:ss")}
              disabled
            />
          </div>
        </div>
      </form>
      <div className="flex items-center gap-2">
        <button
          className={twMerge(
            "bg-red-500 text-white py-2 px-4 rounded-md duration-150 hover:bg-red-600",
            "disabled:bg-gray-300 disabled:text-gray-500"
          )}
          onClick={deleteReport}
        >
          削除する
        </button>
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
  const report = await db.report.findUnique({
    where: {
      id: ctx.query.reportId?.toString(),
    },
  });
  if (!report) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      report: JSON.parse(JSON.stringify(report)),
    },
  };
};
