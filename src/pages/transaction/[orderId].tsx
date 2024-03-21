import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";
import {
  MdOutlineAttachMoney,
  MdOutlineCheck,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { format, formatDistanceToNow } from "date-fns";
import Reviews from "@/components/Reviews";
import { useState } from "react";
import { useRouter } from "next/router";
import { ja } from "date-fns/locale";
import nl2br from "react-nl2br";
import toast from "react-hot-toast";
import Rating from "@/components/Rating";
import NextHeadSeo from "next-head-seo";
import { getAvatar, getItemImage } from "@/utils/images";

type Order = Prisma.OrderGetPayload<{
  select: {
    id: true;
    expiresAt: true;
    shipped: true;
    complete: true;
    tracking: true;
    createdAt: true;
    item: {
      select: {
        id: true;
        name: true;
        price: true;
        shipping: true;
        images: {
          select: {
            id: true;
            format: true;
          };
        };
        user: {
          select: {
            id: true;
            name: true;
            avatar: true;
          };
        };
      };
    };
    chats: {
      select: {
        id: true;
        text: true;
        createdAt: true;
        user: {
          select: {
            id: true;
            name: true;
            avatar: true;
          };
        };
      };
    };
    user: {
      select: {
        id: true;
        reviews: {
          select: {
            id: true;
            rating: true;
          };
        };
      };
    };
    address: true;
  };
}>;

export default function Transaction({
  order,
  userId,
}: {
  order: Order;
  userId: string;
}) {
  const [chat, setChat] = useState("");
  const [tracking, setTracking] = useState("");
  const router = useRouter();
  const yamato = ["宅急便（ヤマト運輸）"];
  const sagawa = ["宅配便（佐川急便）"];
  const jppost = [
    "ゆうパック",
    "ゆうメール",
    "ゆうパケット",
    "レターパックライト",
    "レターパックプラス",
    "クリックポスト",
    "スマートレター",
  ];
  const shippingInclude = yamato.concat(sagawa, jppost);
  const getTrackingUrl = (tracking: string, shipping: string) => {
    if (yamato.includes(shipping)) {
      return `https://jizen.kuronekoyamato.co.jp/jizen/servlet/crjz.b.NQ0010?id=${tracking}`;
    } else if (sagawa.includes(shipping)) {
      return `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${tracking}`;
    } else if (jppost.includes(shipping)) {
      return `https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=${tracking}`;
    } else {
      return "";
    }
  };
  return (
    <Layout>
      <NextHeadSeo
        title={`${order.item.name}の取引 - EMC Shop`}
        description={`${order.item.name}の取引`}
        canonical={`https://shop.emcmusic.net/transaction/${order.id}`}
        og={{
          title: `${order.item.name}の取引 - EMC Shop`,
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="order-last lg:order-first lg:col-span-1 text-left">
          <h3 className="text-xl font-bold py-2 mb-2">取引情報</h3>
          <hr />
          <Link
            href={`/item/${order.item.id}`}
            className="duration-150 hover:bg-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 my-4">
                <Image
                  src={getItemImage(
                    order.item.images[0].id,
                    order.item.images[0].format
                  )}
                  alt={order.item.name}
                  fill={true}
                  className="aspect-square object-cover rounded-md"
                />
              </div>
              <div>
                <p className="mb-2">{order.item.name}</p>
                <p className="mb-1">
                  <span className="text-sm">¥</span>
                  <span className="text-base font-semibold">
                    {order.item.price}
                  </span>
                  <span className="text-xs">(税込)</span>
                </p>
              </div>
            </div>
            <MdOutlineKeyboardArrowRight size={24} />
          </Link>
          <hr />
          <div className="py-4">
            <table className="table-auto w-full">
              <tbody>
                <tr>
                  <td className="font-semibold py-2">商品代金</td>
                  <td>
                    <span className="text-sm">¥</span>
                    <span className="text-base font-semibold">
                      {order.item.price.toLocaleString()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold py-2">追跡番号</td>
                  <td>
                    {order.tracking ? (
                      shippingInclude.includes(order.item.shipping) ? (
                        <a
                          href={getTrackingUrl(
                            order.tracking,
                            order.item.shipping
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-500 hover:underline"
                        >
                          {order.tracking}
                        </a>
                      ) : (
                        order.tracking
                      )
                    ) : (
                      "未入力"
                    )}
                  </td>
                </tr>
                {order.user.id !== userId && (
                  <>
                    <tr>
                      <td className="font-semibold py-2">住所</td>
                      <td>{`${order.address.state} ${order.address.city} ${
                        order.address.street
                      } ${order.address.building || ""}`}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-2">郵便番号</td>
                      <td>{`〒${order.address.zip}`}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-2">宛名</td>
                      <td>{`${order.address.lastName} ${order.address.firstName}`}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-2">電話番号</td>
                      <td>{`${order.address.phone}`}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="font-semibold py-2">配送方法</td>
                  <td>{order.item.shipping}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-2">購入日時</td>
                  <td>{format(order.createdAt, "yyyy年MM月dd日 HH:mm")}</td>
                </tr>
                {order.expiresAt !== null && (
                  <tr>
                    <td className="font-semibold py-2">支払期日</td>
                    <td>{format(order.expiresAt, "yyyy年MM月dd日 HH:mm")}</td>
                  </tr>
                )}
                <tr>
                  <td className="font-semibold py-2">商品ID</td>
                  <td>{order.item.id}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
        </div>
        <div className="lg:col-span-2 text-left">
          <h3 className="text-xl font-bold py-2 mb-2">取引画面</h3>
          {order.complete && (
            <div className="bg-gray-100 border rounded-md mb-4">
              <div className="max-w-3xl mx-auto p-4">
                <p className="text-sm flex items-center">
                  <MdOutlineCheck size={24} className="text-red-500 mr-2" />
                  取引が完了しました
                </p>
              </div>
            </div>
          )}
          {order.expiresAt && order.user.id === userId && (
            <div className="bg-red-100 border border-red-400 rounded-md mb-4">
              <div className="max-w-3xl mx-auto p-4">
                <p className="text-sm flex items-center text-red-500">
                  <MdOutlineAttachMoney size={24} className="mr-2" />
                  支払期日までに、出品者に連絡をして支払いを完了してください
                  <br />
                  支払いが確認できない場合、自動でキャンセルされます
                </p>
              </div>
            </div>
          )}
          {order.expiresAt && order.user.id === userId && (
            <div className="bg-gray-100 border rounded-md mb-4">
              <div className="flex justify-between items-center max-w-3xl mx-auto p-4">
                <p className="text-sm flex items-center">
                  <MdOutlineAttachMoney size={24} className="mr-2" />
                  支払いを確認しましたか？
                </p>
                <button
                  className="bg-sky-500 text-white rounded-md px-4 py-2 duration-150 hover:bg-sky-600"
                  onClick={async () => {
                    const toastId = toast.loading("更新中...");
                    const res = await (
                      await fetch(`/api/order/pay`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          orderId: order.id,
                        }),
                      })
                    ).json();
                    if (res.status === "success") {
                      toast.success("更新しました", {
                        id: toastId,
                      });
                      router.replace(router.asPath);
                    } else {
                      toast.error("エラーが発生しました", {
                        id: toastId,
                      });
                    }
                  }}
                >
                  確認
                </button>
              </div>
            </div>
          )}
          <div>
            {order.user.id === userId &&
              order.expiresAt === null &&
              !order.shipped &&
              !order.complete && (
                <Rating
                  reviewer="user"
                  onSubmit={async (rating, text) => {
                    const toastId = toast.loading("評価中...");
                    const res = await (
                      await fetch(`/api/order/review`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          orderId: order.id,
                          rating: rating === 1,
                          text: text,
                          itemId: order.item.id,
                        }),
                      })
                    ).json();
                    if (res.status === "success") {
                      toast.success("評価しました", {
                        id: toastId,
                      });
                      router.replace(router.asPath);
                    } else {
                      toast.error("エラーが発生しました", {
                        id: toastId,
                      });
                    }
                  }}
                />
              )}
            {order.user.id !== userId && order.shipped && !order.complete && (
              <Rating
                reviewer="seller"
                onSubmit={async (rating, text) => {
                  const toastId = toast.loading("評価中...");
                  const res = await (
                    await fetch(`/api/order/review`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        orderId: order.id,
                        rating: rating === 1,
                        text: text,
                        itemId: order.item.id,
                      }),
                    })
                  ).json();
                  if (res.status === "success") {
                    toast.success("評価しました", {
                      id: toastId,
                    });
                    router.replace(router.asPath);
                  } else {
                    toast.error("エラーが発生しました", {
                      id: toastId,
                    });
                  }
                }}
              />
            )}
          </div>
          <div>
            {!order.complete &&
              order.expiresAt === null &&
              order.user.id === userId &&
              shippingInclude.includes(order.item.shipping) && (
                <div className="mb-4">
                  <label htmlFor="tracking" className="block mb-1">
                    追跡番号
                  </label>
                  <div className="flex">
                    <input
                      id="tracking"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      type="text"
                      className="grow border rounded-l-md p-2 focus:ring-sky-500"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                    <button
                      onClick={async () => {
                        const toastId = toast.loading("更新中...");
                        const res = await (
                          await fetch(`/api/order/tracking`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              orderId: order.id,
                              tracking: tracking,
                            }),
                          })
                        ).json();
                        if (res.status === "success") {
                          toast.success("更新しました", {
                            id: toastId,
                          });
                          setTracking("");
                        } else {
                          toast.error("エラーが発生しました", {
                            id: toastId,
                          });
                        }
                        router.replace(router.asPath);
                      }}
                      className="bg-sky-500 text-white rounded-r-md px-4 duration-150 hover:bg-sky-600"
                    >
                      更新
                    </button>
                  </div>
                </div>
              )}
          </div>
          <div>
            <div className="flex flex-col gap-4">
              {order.chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-start gap-2 p-4 bg-gray-100 my-2"
                >
                  <div className="w-11 h-11 relative mt-2">
                    <Image
                      src={getAvatar(chat.user.id, chat.user.avatar)}
                      alt={chat.user.name || ""}
                      fill={true}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{chat.user.name}</p>
                    <p>{nl2br(chat.text)}</p>
                    <p className="text-sm mt-1">
                      {formatDistanceToNow(new Date(chat.createdAt), {
                        locale: ja,
                      })}
                      前
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {!order.complete && (
              <>
                <label htmlFor="comment" className="block mb-1">
                  取引メッセージ
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  className="w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder={
                    order.user.id === userId
                      ? "出品者へ連絡したい内容を入力してください"
                      : "購入者へ連絡したい内容を入力してください"
                  }
                  onChange={(e) => setChat(e.target.value)}
                  value={chat}
                ></textarea>
                <button
                  className="bg-sky-500 text-white rounded-md px-4 py-2 duration-150 hover:bg-sky-600 disabled:bg-gray-400 w-full"
                  disabled={chat.length === 0}
                  onClick={async () => {
                    const res = await (
                      await fetch(`/api/order/chat`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          orderId: order.id,
                          text: chat,
                        }),
                      })
                    ).json();
                    if (res.status === "success") {
                      setChat("");
                    }
                    router.replace(router.asPath);
                  }}
                >
                  メッセージを送信する
                </button>
              </>
            )}
          </div>
          <div className="py-4">
            <h4 className="text-lg font-bold mb-2">購入者情報</h4>
            <hr />
            <Link
              href={`/user/profile/${order.item.user.id}`}
              className="flex justify-between items-center py-4 duration-150 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <div className="w-11 h-11 relative">
                  <Image
                    src={getAvatar(order.item.user.id, order.item.user.avatar)}
                    alt={order.item.user.name || ""}
                    fill={true}
                    className="rounded-full"
                  />
                </div>
                <div className="ml-2 flex flex-col items-start">
                  <p className="font-semibold">{order.item.user.name}</p>
                  <Reviews reviews={order.user.reviews} />
                </div>
              </div>
              <MdOutlineKeyboardArrowRight size={24} />
            </Link>
            <hr />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    const order = await db.order.findUnique({
      where: {
        id: ctx.params?.orderId?.toString(),
      },
      select: {
        id: true,
        expiresAt: true,
        shipped: true,
        complete: true,
        tracking: true,
        createdAt: true,
        item: {
          select: {
            id: true,
            name: true,
            price: true,
            shipping: true,
            images: {
              select: {
                id: true,
                format: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        chats: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            reviews: {
              select: {
                id: true,
                rating: true,
              },
            },
          },
        },
        address: true,
      },
    });
    if (!order) {
      return {
        notFound: true,
      };
    }
    if (
      order.user.id !== session.user.id ||
      order.item.user.id !== session.user.id
    ) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    if (order.expiresAt && new Date() > order.expiresAt) {
      await db.order.delete({
        where: {
          id: order.id,
        },
      });
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    return {
      props: {
        order: JSON.parse(JSON.stringify(order)),
        userId: session.user.id,
      },
    };
  }
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};
