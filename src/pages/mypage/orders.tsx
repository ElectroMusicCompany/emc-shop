import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import ItemCard from "@/components/ItemCard";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import NextHeadSeo from "next-head-seo";

type UserWithOrders = Prisma.UserGetPayload<{
  include: {
    orders: {
      include: {
        item: {
          include: {
            images: true;
            user: true;
          };
        };
      };
    };
  };
}>;

export default function UserPage({ user }: { user: UserWithOrders }) {
  const router = useRouter();
  return (
    <Layout>
      <NextHeadSeo
        title="購入した商品 - EMC Shop"
        description="購入した商品"
        canonical={`https://shop.emcmusic.net/mypage/orders`}
        og={{
          title: "購入した商品 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          購入した商品
        </h3>
        {user.orders.length === 0 && <p>購入した商品はありません。</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {user.orders.map((order, i) => (
            <ItemCard
              item={order.item}
              href={`/item/${order.item.id}`}
              sold={true}
              key={i}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        orders: {
          include: {
            item: {
              include: {
                images: true,
                user: true,
              },
            },
          },
        },
      },
    });
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
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
