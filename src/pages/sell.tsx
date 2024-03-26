import Layout from "@/components/Layout";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { MdOutlinePhotoCamera, MdOutlineClose } from "react-icons/md";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import NextHeadSeo from "next-head-seo";
import { getItemImage } from "@/utils/images";

type Inputs = {
  name: string;
  description?: string;
  state: string;
  shipping: string;
  shipping_other?: string;
  stripe: boolean;
  points: boolean;
  price: number;
};

type Item = Prisma.ItemGetPayload<{
  include: {
    images: true;
    order: {
      select: {
        id: true;
      };
    };
  };
}>;

type Thumb = {
  id: string;
  url: string;
};

export default function Sell({
  user,
  item,
}: {
  user: { id: string; stripeId: string };
  item?: Item;
}) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const {
    register,
    formState: { errors, isValid, isDirty },
    watch,
    handleSubmit,
    setValue,
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: { points: true, stripe: false },
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        setImages([...images, ...files]);
        setThumbs([
          ...thumbs,
          ...(await Promise.all(
            files.map(async (file) => ({
              id: file.name,
              url: await getBase64(file),
            }))
          )),
        ]);
      }
    },
    [thumbs, images]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
  });

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const toastId = toast.loading("画像をアップロード中...");
    try {
      if (!thumbs || thumbs.length === 0) {
        toast.error("画像を1枚以上追加してください", {
          id: toastId,
        });
        return;
      }
      let uploaded = [];
      let mediaIds: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await (
          await fetch(`/api/item/upload`, {
            method: "POST",
            body: formData,
          })
        ).json();
        if (res.status === "success") {
          uploaded.push({ id: res.imageId, name: file.name });
        } else {
          throw new Error("Failed to upload image");
        }
      }
      if (item) {
        if (item.images) {
          mediaIds = thumbs.map((thumb) => {
            if (thumb.url.startsWith("data:")) {
              const img = uploaded.find((u) => u.name === thumb.id);
              return img ? img.id : thumb.id;
            } else {
              return thumb.id;
            }
          });
        }
        const res = await (
          await fetch(`/api/item/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              images: mediaIds,
              name: data.name,
              description: data.description,
              state: data.state,
              shipping:
                data.shipping === "その他"
                  ? data.shipping_other
                  : data.shipping,
              stripe: data.stripe,
              price: data.price,
              itemId: item.id,
            }),
          })
        ).json();
        if (res.status !== "success") {
          throw new Error("Failed to create item");
        }
        toast.success("商品を編集しました", {
          id: toastId,
        });
        router.push(`/item/${res.itemId}`);
      } else {
        const mediaIds = uploaded.map((img) => img.id);
        const res = await (
          await fetch(`/api/item/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              images: mediaIds,
              name: data.name,
              description: data.description,
              state: data.state,
              shipping:
                data.shipping === "その他"
                  ? data.shipping_other
                  : data.shipping,
              stripe: data.stripe,
              price: data.price,
            }),
          })
        ).json();
        if (res.status !== "success") {
          throw new Error("Failed to create item");
        }
        toast.success("商品を出品しました", {
          id: toastId,
        });
        router.push(`/item/${res.itemId}`);
      }
    } catch (error) {
      toast.error("画像のアップロードに失敗しました", {
        id: toastId,
      });
      console.error(error);
    }
  };

  const shipping = [
    "未定",
    "宅急便（ヤマト運輸）",
    "宅配便（佐川急便）",
    "ゆうパック",
    "ゆうメール",
    "ゆうパケット",
    "レターパックライト",
    "レターパックプラス",
    "クリックポスト",
    "スマートレター",
    "定形外郵便",
    "手渡し",
    "その他",
  ];

  const state = [
    "新品・未開封",
    "未使用に近い",
    "目立った傷や汚れなし",
    "やや傷や汚れあり",
    "傷や汚れあり",
    "全体的に状態が悪い",
  ];

  useEffect(() => {
    if (item) {
      setValue("name", item.name);
      setValue("description", item.description || "");
      setValue("state", item.state);
      setValue(
        "shipping",
        shipping.includes(item.shipping) ? item.shipping : "その他"
      );
      setValue(
        "shipping_other",
        shipping.includes(item.shipping) ? "" : item.shipping
      );
      setValue("stripe", item.stripe);
      setValue("price", item.price);
      setThumbs(
        item.images.map((img) => ({
          id: img.id,
          url: getItemImage(img.id, img.format),
        }))
      );
    }
  }, []);

  return (
    <Layout>
      <NextHeadSeo
        title="出品 - EMC Shop"
        description="出品"
        canonical="https://shop.emcmusic.net/sell"
        og={{
          title: "出品 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-xl mx-auto ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-xl font-bold text-left py-4">出品する</h3>
          <div className="flex flex-col mb-4">
            <div className="flex mb-2">
              {thumbs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Array.from(thumbs)
                    .reverse()
                    .map((thumb, i) => (
                      <div className="relative" key={i}>
                        <img
                          src={thumb.url}
                          alt=""
                          className="h-32 object-cover aspect-square rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (thumb.url.startsWith("data:")) {
                              const newImages = images.filter(
                                (img) => img.name !== thumbs[i].id
                              );
                              setImages(newImages);
                              setThumbs(
                                thumbs.filter((t) => t.id !== thumb.id)
                              );
                            } else {
                              setThumbs(
                                thumbs.filter((t) => t.id !== thumb.id)
                              );
                            }
                          }}
                          className="absolute top-1 right-1 bg-white rounded-full p-1"
                        >
                          <MdOutlineClose size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {thumbs && thumbs.length >= 10 ? (
              <p className="text-red-500">10枚まで選択できます</p>
            ) : (
              <div
                {...getRootProps()}
                className="w-full cursor-pointer flex flex-col items-center py-8 justify-center border rounded-md border-dashed border-gray-500 hover:border-sky-500"
              >
                <input {...getInputProps()} />
                <MdOutlinePhotoCamera size={32} />
                <p>商品画像（最大10枚まで）</p>
              </div>
            )}
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="name">
              商品名<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: true,
                maxLength: 40,
              })}
              className={twMerge(
                "border rounded-md",
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.name ? "true" : "false"}
            />
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="state">
              商品の状態<span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              {...register("state")}
              className={twMerge(
                "border rounded-md",
                errors.state
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-sky-500 focus:ring-sky-500"
              )}
              aria-invalid={errors.state ? "true" : "false"}
            >
              <option value="新品・未開封">新品・未開封</option>
              <option value="未使用に近い">未使用に近い</option>
              <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
              <option value="やや傷や汚れあり">やや傷や汚れあり</option>
              <option value="傷や汚れあり">傷や汚れあり</option>
              <option value="全体的に状態が悪い">全体的に状態が悪い</option>
            </select>
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="description">商品説明</label>
            <span className="text-xs mb-2">Markdownの一部記法が使えます。</span>
            <textarea
              id="description"
              rows={6}
              className="border rounded-md focus:border-sky-500 focus:ring-sky-500"
              placeholder={
                "商品の説明を入力してください\n例：2020年に中古店で購入しました。CDケースに多少の傷があります。\n帯・特典等はありません。"
              }
              {...register("description", {
                maxLength: 1000,
              })}
            />
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="shipping">
              配送方法<span className="text-red-500">*</span>
            </label>
            <select
              className="border rounded-md focus:ring-sky-500 focus:border-sky-500"
              id="shipping"
              {...register("shipping")}
            >
              <option value="未定">未定</option>
              <option value="宅急便（ヤマト運輸）">宅急便（ヤマト運輸）</option>
              <option value="宅配便（佐川急便）">宅配便（佐川急便）</option>
              <option value="ゆうパック">ゆうパック</option>
              <option value="ゆうメール">ゆうメール</option>
              <option value="ゆうパケット">ゆうパケット</option>
              <option value="レターパックライト">レターパックライト</option>
              <option value="レターパックプラス">レターパックプラス</option>
              <option value="クリックポスト">クリックポスト</option>
              <option value="スマートレター">スマートレター</option>
              <option value="定形外郵便">定形外郵便</option>
              <option value="手渡し">手渡し</option>
              <option value="その他">その他</option>
            </select>
            {watch("shipping") === "その他" && (
              <input
                type="text"
                placeholder="配送方法"
                className={twMerge(
                  "mt-1 border rounded-md",
                  errors.shipping_other
                    ? "border-red-5000 focus:border-red-500 focus:red-sky-500"
                    : "focus:ring-sky-500 focus:border-sky-500"
                )}
                {...register("shipping_other", {
                  required: watch("shipping") === "その他",
                  maxLength: 20,
                })}
              />
            )}
          </div>
          <div className="flex flex-col mb-4">
            <label htmlFor="price">
              価格<span className="text-red-500">*</span>
            </label>
            <span className="text-xs mb-1">
              送料込みの価格を設定してください
            </span>
            <div className="relative">
              <span className="absolute cursor-default top-1/2 -translate-y-1/2 px-4 font-bold">
                ¥
              </span>
              <input
                type="number"
                id="price"
                className={twMerge(
                  "no-spin w-full text-right font-semibold text-lg rounded-md",
                  errors.price
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "focus:border-sky-500 focus:ring-sky-500"
                )}
                min={0}
                placeholder="0"
                {...register("price", {
                  required: true,
                  min: 0,
                  max: 1000000,
                })}
              />
            </div>
          </div>
          {!user.stripeId && (
            <div className="bg-red-200 border border-red-500 text-red-700 rounded-md mb-4 text-center">
              <div className="max-w-3xl mx-auto p-4">
                <p className="text-sm">
                  Stripeを利用するには、
                  <Link href="/mypage/bank" className="underline">
                    本人確認
                  </Link>
                  をしてください
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="points">ポイント払いを許可する</label>
              <input
                id="points"
                type="checkbox"
                defaultChecked={true}
                className="focus:ring-sky-500 rounded text-sky-500"
                {...register("points", {
                  required: false,
                })}
              />
            </div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="stripe">Stripeを利用しない</label>
              <input
                id="stripe"
                type="checkbox"
                defaultChecked={false}
                className="focus:ring-sky-500 rounded text-sky-500"
                {...register("stripe", {
                  required: false,
                })}
              />
            </div>
            <span className="text-xs mb-2">
              Stripeを利用しない場合、購入者に別の支払い方法を提供してください
            </span>
            <div className="flex justify-between items-center mb-2">
              <p>Stripe利用手数料</p>
              <p>
                ¥
                {watch("stripe")
                  ? 0
                  : (Math.round(watch("price") * 0.036) || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p>販売利益</p>
              <p>
                ¥
                {watch("stripe")
                  ? (watch("price") || 0).toLocaleString()
                  : (
                      watch("price") - Math.round(watch("price") * 0.036) || 0
                    ).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={!isValid || !user.stripeId || thumbs.length === 0}
            className="w-full bg-sky-500 text-white py-2 rounded-md my-4 font-medium duration-150 hover:bg-sky-600 disabled:bg-gray-400"
          >
            出品する
          </button>
        </form>
        {item && (
          <button
            onClick={async () => {
              const loading = toast.loading("削除中...");
              const res = await fetch("/api/item/delete", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: item.id,
                }),
              });
              if (res.status !== 200) {
                toast.error("エラーが発生しました", {
                  id: loading,
                });
                return;
              }
              toast.success("削除しました", {
                id: loading,
              });
              router.push("/");
            }}
            className="w-full bg-red-500 text-white py-2 rounded-md my-4 font-medium duration-150 hover:bg-red-600"
          >
            削除する
          </button>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  // query
  const itemId = ctx.query.edit as string;
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      stripeId: true,
    },
  });
  if (itemId) {
    const item = await db.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
        images: true,
        order: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!item || item.order) {
      return {
        props: {
          user: JSON.parse(JSON.stringify(user)),
        },
      };
    }
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        item: JSON.parse(JSON.stringify(item)),
      },
    };
  }
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};
