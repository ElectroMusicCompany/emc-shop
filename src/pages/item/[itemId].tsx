import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";
import type { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Reviews from "@/components/Reviews";
import Image from "next/image";
import nl2br from "react-nl2br";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import NextHeadSeo from "next-head-seo";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";

type ItemWithImages = Prisma.ItemGetPayload<{
  include: {
    images: true;
    order: true;
    user: {
      include: {
        reviews: true;
      };
    };
    comments: {
      include: {
        user: true;
      };
    };
    favorite: true;
  };
}>;

type UserWithFavorite = Prisma.UserGetPayload<{
  include: {
    favorite: true;
    reviews: true;
  };
}>;

export default function ItemPage({
  item,
  user,
}: {
  item: ItemWithImages;
  user: UserWithFavorite;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      const isFavorite = user.favorite.find(
        (favorite) => favorite.itemId === item.id
      );
      if (isFavorite) {
        setIsLiked(true);
      }
    }
  }, []);
  return (
    <Layout>
      <NextHeadSeo
        title={`${item.name} - EMC Shop`}
        description={`${item.name} | ¥${item.price}`}
        canonical={`https://shop.emcmusic.net/item/${item.id}`}
        og={{
          title: `${item.name} - EMC Shop`,
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex-col flex lg:flex-row gap-2">
          <div className="order-last lg:order-first grid grid-cols-4 md:grid-cols-6 gap-2 lg:gap-0 lg:w-20 lg:h-full lg:flex lg:flex-col">
            {item.images.map((img, i) => (
              <button
                key={img.id}
                className={twMerge(
                  "box-content relative h-full w-full aspect-square lg:w-20 lg:h-20 lg:mb-2 overflow-hidden",
                  i === image
                    ? "border-2 border-sky-500"
                    : "border-2 border-gray-200"
                )}
                onClick={() => setImage(i)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${img.id}.${img.format}`}
                  alt={item.name}
                  fill={true}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <div className="grow relative h-96 bg-gray-200">
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${item.images[image].id}.${item.images[image].format}`}
              alt={item.name}
              fill={true}
              className="object-contain rounded-md"
            />
            {item.order != null && (
              <>
                <div className="absolute border-l-[7rem] border-b-[7rem] border-transparent rounded-tl-md border-l-red-500 inline-block left-0 top-0"></div>
                <div className="absolute text-xl text-white top-5 left-2 -rotate-45">
                  SOLD
                </div>
              </>
            )}
          </div>
        </div>
        <div className="text-left">
          <h3 className="text-2xl font-semibold mb-1">{item.name}</h3>
          <p className="mb-1">
            <span className="text-sm">¥</span>
            <span className="text-2xl">{item.price.toLocaleString()}</span>
          </p>
          {session && (
            <div className="py-4">
              <button
                className="flex flex-col items-center rounded-md p-2 duration-150 hover:bg-gray-100"
                onClick={async () => {
                  const fav = await (
                    await fetch(`/api/user/favorite?itemId=${item.id}`)
                  ).json();
                  if (fav.status === "success") {
                    setIsLiked(!isLiked);
                    router.replace(router.asPath);
                  }
                }}
              >
                {isLiked ? (
                  <GoHeartFill size={24} color="#e61e4c" />
                ) : (
                  <GoHeart size={24} />
                )}
                <span className="text-xs">
                  {item.favorite.length > 0
                    ? item.favorite.length
                    : "お気に入り"}
                </span>
              </button>
            </div>
          )}
          {session && (
            <div className="py-4 font-medium">
              {item.order != null ? (
                item.order.userId === user.id ? (
                  <Link
                    href={`/transaction/${item.order.id}`}
                    className="block text-center w-full bg-sky-500 text-white rounded-md py-2 px-4 duration-150 hover:bg-sky-600"
                  >
                    取引画面へ
                  </Link>
                ) : (
                  <button className="w-full bg-gray-400 text-white rounded-md py-2 px-4 duration-150 cursor-not-allowed">
                    売り切れました
                  </button>
                )
              ) : item.userId === user.id ? (
                <Link
                  href={`/sell?edit=${item.id}`}
                  className="block text-center w-full border border-sky-500 text-sky-500 rounded-md py-2 px-4 duration-150 hover:bg-sky-100"
                >
                  商品を編集
                </Link>
              ) : (
                <Link
                  href={`/purchase/${item.id}`}
                  className="block text-center w-full bg-sky-500 text-white rounded-md py-2 px-4 duration-150 hover:bg-sky-600"
                >
                  購入手続きへ
                </Link>
              )}
            </div>
          )}
          <h4 className="text-xl font-semibold mt-8 mb-2">商品の説明</h4>
          <div className="prose max-w-none">
            <ReactMarkdown
              allowedElements={[
                "p",
                "strong",
                "underline",
                "stroke",
                "ul",
                "ol",
                "li",
              ]}
            >
              {item.description}
            </ReactMarkdown>
          </div>
          <p className="text-sm my-3">
            {formatDistanceToNow(new Date(item.createdAt), { locale: ja })}前
          </p>
          <h4 className="text-xl font-semibold mt-8 mb-2">商品の情報</h4>
          <hr />
          <table className="table-auto w-full">
            <tbody>
              <tr>
                <td className="font-semibold py-2">商品の状態</td>
                <td>{item.state}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2">配送の方法</td>
                <td>{item.shipping}</td>
              </tr>
            </tbody>
          </table>
          <hr />
          <h4 className="text-xl font-semibold mt-8 mb-2">出品者</h4>
          <hr />
          <Link
            href={`/user/profile/${item.userId}`}
            className="flex justify-between items-center py-4 duration-150 hover:bg-gray-100"
          >
            <div className="flex items-center">
              <div className="w-11 h-11 relative">
                <Image
                  src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.user.avatar}.png`}
                  alt={item.user.name || ""}
                  fill={true}
                  className="rounded-full"
                />
              </div>
              <div className="ml-2 flex flex-col items-start">
                <p className="font-semibold">{item.user.name}</p>
                <Reviews reviews={item.user.reviews} />
              </div>
            </div>
            <MdOutlineKeyboardArrowRight size={24} />
          </Link>
          <hr />
          <h4 className="text-xl font-semibold mt-8 mb-2">
            コメント({item.comments.length})
          </h4>
          <hr />
          <div className="flex flex-col gap-4">
            {item.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 py-4">
                <div className="w-11 h-11 relative mt-2">
                  <Image
                    src={`https://cdn.discordapp.com/avatars/${comment.userId}/${comment.user.avatar}.png`}
                    alt={comment.user.name || ""}
                    fill={true}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold">{comment.user.name}</p>
                  <p>{nl2br(comment.text)}</p>
                  <p className="text-sm mt-1">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      locale: ja,
                    })}
                    前
                  </p>
                </div>
              </div>
            ))}
          </div>
          {session && (
            <div className="my-4">
              <label htmlFor="comment" className="block mb-1">
                商品へのコメント
              </label>
              <textarea
                id="comment"
                rows={3}
                className="w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="コメントする"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              ></textarea>
              <button
                className="bg-sky-500 text-white rounded-md px-4 py-2 duration-150 hover:bg-sky-600 disabled:bg-gray-400 w-full"
                disabled={comment.length === 0}
                onClick={async () => {
                  const toastId = toast.loading("コメントしています");
                  const res = await (
                    await fetch(`/api/item/comment`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        itemId: item.id,
                        text: comment,
                      }),
                    })
                  ).json();
                  if (res.status === "success") {
                    toast.success("コメントしました", {
                      id: toastId,
                    });
                    setComment("");
                  }
                  router.replace(router.asPath);
                }}
              >
                コメントする
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const item = await db.item.findUnique({
    where: {
      id: ctx.query.itemId as string,
    },
    include: {
      images: true,
      user: {
        include: {
          reviews: true,
        },
      },
      order: true,
      comments: {
        include: {
          user: true,
        },
      },
      favorite: true,
    },
  });
  if (session) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        favorite: true,
        reviews: true,
      },
    });

    if (item) {
      return {
        props: {
          item: JSON.parse(JSON.stringify(item)),
          user: JSON.parse(JSON.stringify(user)),
        },
      };
    }
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        item: JSON.parse(JSON.stringify(item)),
        user: null,
      },
    };
  }
};
