import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import NextHeadSeo from "next-head-seo";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { Review } from "@prisma/client";
import { format } from "date-fns";
import { useEffect } from "react";

export default function AdminReports({ review }: { review: Review }) {
  const { register, handleSubmit, watch, setValue } = useForm<Review>();
  const deleteReview = async () => {
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: review.id,
      }),
    });
    const d = await res.json();
    if (d.status === "success") {
      window.location.href = "/adm/reviews";
    }
  };
  useEffect(() => {
    setValue("text", review.text);
    setValue("userId", review.userId);
    setValue("itemId", review.itemId);
    setValue("buyer", review.buyer);
    setValue("createdAt", review.createdAt);
  });
  return (
    <AdminLayout url="review">
      <NextHeadSeo title={`${review.id} - レビュー - EMC Shop Admin`} />
      <h2 className="text-2xl font-bold">レビュー - {review.id}</h2>
      <form className="w-full max-w-xl my-2">
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="rating"
            >
              購入者 / 出品者
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="buyer"
              type="text"
              placeholder="購入者"
              disabled
              value={review.buyer ? "購入者" : "出品者"}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="rating"
            >
              評価
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="rating"
              type="text"
              placeholder="良い"
              disabled
              value={review.rating ? "良い" : "悪い"}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label
              className="block tracking-wide text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              評価内容
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
              htmlFor="createdAt"
            >
              作成日
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="itemId"
              type="text"
              placeholder="createdAt"
              value={format(review.createdAt, "yyyy-MM-dd HH:mm:ss")}
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
          onClick={deleteReview}
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
  const review = await db.review.findUnique({
    where: {
      id: ctx.query.reviewId?.toString(),
    },
  });
  if (!review) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      review: JSON.parse(JSON.stringify(review)),
    },
  };
};
