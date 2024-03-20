import AdminLayout from "@/components/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { Item, Order, User } from "@prisma/client";
import { db } from "@/lib/prisma";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function AdminItems({ item }: { item: Item }) {
  const { register, handleSubmit, watch, setValue } = useForm<Item>();
  const onSubmit: SubmitHandler<Item> = async (data) => {};
  useEffect(() => {
    setValue("name", item.name);
    setValue("price", item.price);
    setValue("description", item.description);
    setValue("state", item.state);
    setValue("shipping", item.shipping);
    setValue("userId", item.userId);
    setValue("createdAt", item.createdAt);
  }, []);
  return (
    <AdminLayout url="item">
      <NextHeadSeo title={`${item.id} - 商品 - EMC Shop Admin`} />
      <h2 className="text-2xl font-bold">商品 - {item.id}</h2>
      <form className="w-full max-w-xl my-2">
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="name"
            >
              商品名
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="name"
              type="text"
              placeholder="name"
              disabled
              {...register("name")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="price"
            >
              価格
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="price"
              type="text"
              placeholder="price"
              disabled
              {...register("price")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              商品説明
            </label>
            <textarea
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="description"
              placeholder="description"
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
              htmlFor="description"
            >
              商品の状態
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="state"
              type="text"
              placeholder="state"
              disabled
              {...register("state")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              配送方法
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="shipping"
              type="text"
              placeholder="shipping"
              disabled
              {...register("shipping")}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              Stripeを利用しない
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="stripe"
              type="text"
              value={item.stripe ? "はい" : "いいえ"}
              disabled
            />
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
  const item = await db.item.findUnique({
    where: {
      id: ctx.query.itemId?.toString(),
    },
    include: {
      order: true,
    },
  });
  return {
    props: {
      item: JSON.parse(JSON.stringify(item)),
    },
  };
};