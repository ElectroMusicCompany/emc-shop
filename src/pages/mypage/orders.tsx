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
import Pagination from "@/components/Pagination";

type UserWithOrders = Prisma.UserGetPayload<{
  select: {
    orders: {
      select: {
        item: {
          select: {
            id: true;
            name: true;
            price: true;
            images: true;
          };
        };
      };
    };
  };
}>;

export default function UserPage({
  user,
  page,
  ordersCount,
}: {
  user: UserWithOrders;
  page: number;
  ordersCount: number;
}) {
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
        <div className="items-start grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {user.orders.map((order, i) => (
            <ItemCard
              item={order.item}
              href={`/item/${order.item.id}`}
              sold={true}
              key={i}
            />
          ))}
        </div>
        <Pagination
          path="/mypage/orders"
          page={page}
          count={Math.floor(ordersCount / 24) || 1}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const page = ctx.query.page ? Number(ctx.query.page) : 1;
  if (session) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        orders: {
          select: {
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
          take: 24 * page,
          skip: 24 * (page - 1),
        },
      },
    });
    const ordersCount = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
    return {
      props: {
        page,
        user: JSON.parse(JSON.stringify(user)),
        ordersCount: ordersCount?._count.orders || 0,
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
