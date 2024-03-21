import Layout from "@/components/Layout";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import NextHeadSeo from "next-head-seo";

type Inputs = {
  id: string;
  type: string;
  text: string;
  report_type: string;
  userId: string;
};

export default function Report({ user }: { user: { id: string } }) {
  const router = useRouter();
  const {
    register,
    formState: { errors, isValid },
    watch,
    handleSubmit,
    setValue,
  } = useForm<Inputs>({ mode: "onChange" });
  const { itemId, orderId } = router.query;

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const toastId = toast.loading("送信中...");
    try {
      const res = await fetch("/api/user/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: itemId?.toString() || "",
          orderId: orderId?.toString() || "",
          text: data.text,
        }),
      });
      if (res.status === 200) {
        const d = await res.json();
        if (d.status === "success") {
          toast.success("送信しました", {
            id: toastId,
          });
          router.push("/");
        } else {
          toast.error("エラーが発生しました", {
            id: toastId,
          });
        }
      }
    } catch (error) {
      toast.error("画像のアップロードに失敗しました", {
        id: toastId,
      });
      console.error(error);
    }
  };

  useEffect(() => {
    setValue("id", orderId?.toString() || itemId?.toString() || "");
    setValue("type", orderId ? "order" : "item");
    setValue("userId", user.id);
  }, []);

  return (
    <Layout>
      <NextHeadSeo
        title="通報 - EMC Shop"
        description="出品"
        canonical="https://shop.emcmusic.net/report"
        og={{
          title: "通報 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-xl mx-auto ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-xl font-bold text-left py-4">通報する</h3>
          <div className="flex flex-col mb-4">
            <label htmlFor="name">
              該当ID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="id"
              disabled
              {...register("id", {
                required: true,
              })}
              className={twMerge(
                "border rounded-md disabled:bg-gray-100 disabled:text-gray-500",
                errors.id
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.id ? "true" : "false"}
            />
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="userId">
              送信ユーザーID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userId"
              disabled
              {...register("userId", {
                required: true,
              })}
              className={twMerge(
                "border rounded-md disabled:bg-gray-100 disabled:text-gray-500",
                errors.userId
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.userId ? "true" : "false"}
            />
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="type">
              種類<span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register("type", {
                required: true,
              })}
              disabled
              className={twMerge(
                "border rounded-md disabled:bg-gray-100 disabled:text-gray-500",
                errors.type
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.type ? "true" : "false"}
            >
              <option value="item">商品</option>
              <option value="order">取引</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="report_type">
              報告の種類<span className="text-red-500">*</span>
            </label>
            <select
              id="report_type"
              {...register("report_type", {
                required: true,
              })}
              className={twMerge(
                "border rounded-md disabled:bg-gray-100 disabled:text-gray-500",
                errors.report_type
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.report_type ? "true" : "false"}
            >
              <option value="other">その他</option>
            </select>
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="text">
              理由<span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              rows={6}
              className="border rounded-md focus:border-sky-500 focus:ring-sky-500"
              placeholder={"通報理由を詳細に説明してください。"}
              {...register("text", {
                required: true,
                maxLength: 1000,
              })}
            />
          </div>
          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-sky-500 text-white py-2 rounded-md my-4 font-medium duration-150 hover:bg-sky-600 disabled:bg-gray-400"
          >
            送信
          </button>
        </form>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const { itemId, orderId } = ctx.query;
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  if (!itemId && !orderId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  if (itemId) {
    const item = await db.item.findUnique({
      where: {
        id: itemId.toString(),
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (!item) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }
  if (orderId) {
    const order = await db.order.findUnique({
      where: {
        id: orderId.toString(),
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (!order) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
    },
  });
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};
