import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import Image from "next/image";
import Reviews from "@/components/Reviews";
import ItemCard from "@/components/ItemCard";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import NextHeadSeo from "next-head-seo";
import { getAvatar } from "@/utils/images";

type UserWithItems = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    avatar: true;
    description: true;
    items: {
      select: {
        id: true;
        name: true;
        price: true;
        images: true;
        order: {
          select: {
            id: true;
          };
        };
      };
    };
    reviews: {
      select: {
        id: true;
        rating: true;
      };
    };
  };
}>;

export default function UserPage({
  user,
  sessionUserId,
}: {
  user: UserWithItems;
  sessionUserId: string;
}) {
  return (
    <Layout>
      <NextHeadSeo
        title={`${user.name}の出品した商品 - EMC Shop`}
        description="${user.name}の出品した商品"
        canonical={`https://shop.emcmusic.net/user/profile/${user.id}`}
        og={{
          title: "${user.name}の出品した商品 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between max-w-3xl gap-6">
          <Image
            src={getAvatar(user.id, user.avatar)}
            alt={user.name || ""}
            width={100}
            height={100}
            className="rounded-full"
          />
          <div className="grow text-left">
            <h3 className="text-2xl font-bold mb-2">{user.name}</h3>
            <Link href={`/user/reviews/${user.id}`}>
              <Reviews reviews={user.reviews} />
            </Link>
          </div>
          {sessionUserId && user.id === sessionUserId && (
            <Link
              href={`/mypage/profile`}
              className="bg-sky-500 text-white px-3 py-2 rounded-md hover:bg-sky-600 duration-150 text-sm"
            >
              プロフィール編集
            </Link>
          )}
        </div>
        <div className="flex gap-4 my-4">
          <p className="font-semibold text-lg">
            {user.items.length}{" "}
            <span className="text-sm font-normal">出品数</span>
          </p>
        </div>
        <p className="prose prose-sm max-w-none text-left pb-8">
          <ReactMarkdown
            allowedElements={[
              "p",
              "strong",
              "italic",
              "ul",
              "li",
              "ol",
              "underline",
            ]}
          >
            {user.description}
          </ReactMarkdown>
        </p>
      </div>
      <hr />
      <div className="items-start grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
        {user.items.map((item, i) => (
          <ItemCard
            item={item}
            href={`/item/${item.id}`}
            sold={item.order != null}
            key={i}
          />
        ))}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const page = ctx.query.page ? Number(ctx.query.page) : 1;
  const user = await db.user.findUnique({
    where: {
      id: ctx.query.userId?.toString(),
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      description: true,
      items: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          order: {
            select: {
              id: true,
            },
          },
        },
        take: 24 * page,
        skip: 24 * (page - 1),
      },
      reviews: {
        select: {
          id: true,
          rating: true,
        },
      },
    },
  });
  if (session) {
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        sessionUserId: session.user.id,
      },
    };
  } else {
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        sessionUserId: null,
      },
    };
  }
};
