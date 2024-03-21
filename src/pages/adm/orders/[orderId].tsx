import AdminLayout from "@/components/admin/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

type Order = Prisma.OrderGetPayload<{
  include: {
    address: true;
  };
}>;

export default function AdminItems({ order }: { order: Order }) {
  const { register, handleSubmit, watch, setValue } = useForm<Order>();
  useEffect(() => {
    setValue("userId", order.userId);
    setValue("itemId", order.itemId);
  }, []);
  const deleteOrder = async () => {
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.id,
      }),
    });
    const d = await res.json();
    if (d.status === "success") {
      window.location.href = "/adm/orders";
    }
  };
  return (
    <AdminLayout url="order">
      <NextHeadSeo title={`${order.id} - 注文 - EMC Shop Admin`} />
      <h2 className="text-2xl font-bold">注文 - {order.id}</h2>
      <form className="w-full max-w-xl my-2">
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
              htmlFor="address"
            >
              住所
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="address"
              type="text"
              placeholder="address"
              value={`${order.address.state} ${order.address.city} ${
                order.address.street
              } ${order.address.building || ""}`}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="zip"
            >
              郵便番号
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="zip"
              type="text"
              placeholder="zip"
              value={order.address.zip}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="tracking"
            >
              追跡番号
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="tracking"
              type="text"
              placeholder="tracking"
              value={order.tracking || "未入力"}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="shipped"
            >
              購入者評価済み
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="tracking"
              type="text"
              placeholder="shipped"
              value={order.shipped ? "はい" : "いいえ"}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="complete"
            >
              出品者評価済み
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="complete"
              type="text"
              placeholder="complete"
              value={order.complete ? "はい" : "いいえ"}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="expiresAt"
            >
              支払期日
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="expiresAt"
              type="text"
              placeholder="expiresAt"
              value={
                order.expiresAt
                  ? format(order.expiresAt, "yyyy-MM-dd HH:mm:ss")
                  : "支払済み"
              }
              disabled
              {...register("expiresAt")}
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
              value={format(order.createdAt, "yyyy-MM-dd HH:mm:ss")}
              disabled
              {...register("createdAt")}
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
          onClick={deleteOrder}
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
  const order = await db.order.findUnique({
    where: {
      id: ctx.query.orderId?.toString(),
    },
    include: {
      address: true,
    },
  });
  return {
    props: {
      order: JSON.parse(JSON.stringify(order)),
    },
  };
};
