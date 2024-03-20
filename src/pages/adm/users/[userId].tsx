import AdminLayout from "@/components/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { User } from "@prisma/client";
import { db } from "@/lib/prisma";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function AdminItems({ user }: { user: User }) {
  const { register, handleSubmit, watch, setValue } = useForm<User>();
  const onSubmit: SubmitHandler<User> = async (data) => {
    const loading = toast.loading("保存中...");
    const res = await fetch("/api/admin/role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        admin: data.admin,
        userId: user.id,
      }),
    });
    const d = await res.json();
    if (d.status === "success") {
      toast.success("保存しました", {
        id: loading,
      });
    } else {
      toast.error("エラーが発生しました", {
        id: loading,
      });
    }
  };
  useEffect(() => {
    setValue("name", user.name);
    setValue("description", user.description);
    setValue("stripeId", user.stripeId);
    setValue("admin", user.admin);
  }, []);
  return (
    <AdminLayout url="user">
      <NextHeadSeo title={`${user.id} - ユーザー - EMC Shop Admin`} />
      <h2 className="text-2xl font-bold">ユーザー - {user.id}</h2>
      <form className="w-full max-w-xl my-2">
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="name"
            >
              ユーザー名
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="name"
              type="text"
              placeholder="User"
              disabled
              {...register("name")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              説明文
            </label>
            <textarea
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="description"
              placeholder="Description"
              rows={5}
              disabled
              {...register("description")}
            ></textarea>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="stripe"
            >
              Stripe ID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="stripe"
              type="text"
              placeholder="Stripe"
              disabled
              {...register("stripeId")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="stripe"
            >
              Stripe ID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="stripe"
              type="text"
              placeholder="Stripe"
              disabled
              {...register("stripeId")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="admin"
            >
              管理者
            </label>
            <select
              className="appearance-none block w-full bg-white text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="admin"
              defaultValue="false"
              {...register("admin")}
            >
              <option value="true">管理者</option>
              <option value="false">ユーザー</option>
            </select>
          </div>
        </div>
        <button
          className={twMerge(
            "bg-sky-500 text-white py-2 px-4 rounded-md duration-150 hover:bg-sky-600",
            "disabled:bg-gray-300 disabled:text-gray-500"
          )}
          onClick={handleSubmit(onSubmit)}
        >
          保存する
        </button>
      </form>
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
  const luser = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!luser?.admin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const user = await db.user.findUnique({
    where: {
      id: ctx.query.userId?.toString(),
    },
  });
  if (!user) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};
