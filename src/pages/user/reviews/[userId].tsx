import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import type { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import Image from "next/image";
import Reviews from "@/components/Reviews";
import ReviewList from "@/components/ReviewList";
import NextHeadSeo from "next-head-seo";

type UserWithItems = Prisma.UserGetPayload<{
  include: {
    items: true;
    reviews: true;
  };
}>;

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: true;
  };
}>;

export default function ReviewPage({
  user,
  reviews,
}: {
  user: UserWithItems;
  reviews: ReviewWithUser[];
}) {
  return (
    <Layout>
      <NextHeadSeo
        title={`${user.name}の評価一覧 - EMC Shop`}
        description="${user.name}の評価一覧"
        canonical={`https://shop.emcmusic.net/user/reviews/${user.id}`}
        og={{
          title: "${user.name}の評価一覧 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 p-4 border">
          <Image
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt={user.name || ""}
            width={100}
            height={100}
            className="rounded-full"
          />
          <h4 className="text-2xl font-bold my-2">{user.name}</h4>
          <Reviews reviews={user.reviews} />
          <div className="flex gap-4 my-4">
            <p className="font-semibold text-lg">
              {user.items.length}{" "}
              <span className="text-sm font-normal">出品数</span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-2 lg:p-4">
          <h3 className="text-2xl font-bold my-2">評価一覧</h3>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await db.user.findUnique({
    where: {
      id: ctx.query.userId?.toString(),
    },
    include: {
      items: true,
      reviews: true,
    },
  });
  const reviews = await db.review.findMany({
    where: {
      OR: [
        {
          item: {
            userId: ctx.query.userId?.toString(),
          },
        },
        {
          item: {
            order: {
              userId: ctx.query.userId?.toString(),
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
  };
};
