import AdminLayout from "@/components/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

type Order = Prisma.OrderGetPayload<{
  include: {
    address: true;
  };
}>;

export default function AdminItems({ order }: { order: Order }) {
  const { register, handleSubmit, watch, setValue } = useForm<Order>();
  const onSubmit: SubmitHandler<Order> = async (data) => {};
  useEffect(() => {
    setValue("userId", order.userId);
    setValue("itemId", order.itemId);
    setValue("createdAt", order.createdAt);
  }, []);
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
              htmlFor="createdAt"
            >
              作成日
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="itemId"
              type="text"
              placeholder="createdAt"
              disabled
              {...register("createdAt")}
            />
          </div>
        </div>
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
