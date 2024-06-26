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

type UserWithItems = Prisma.UserGetPayload<{
  select: {
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
  };
}>;

export default function UserPage({
  user,
  page,
  itemsCount,
}: {
  user: UserWithItems;
  page: number;
  itemsCount: number;
}) {
  const router = useRouter();
  return (
    <Layout>
      <NextHeadSeo
        title="出品した商品 - EMC Shop"
        description="出品した商品"
        canonical={`https://shop.emcmusic.net/mypage/items`}
        og={{
          title: "出品した商品 - EMC Shop",
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
          出品した商品
        </h3>
        {user.items.length === 0 && <p>出品した商品はありません。</p>}
        <div className="items-start grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {user.items.map((item, i) => (
            <ItemCard
              item={item}
              href={`/item/${item.id}`}
              sold={item.order != null}
              key={i}
            />
          ))}
        </div>
        <Pagination
          path="/mypage/items"
          page={page}
          count={Math.floor(itemsCount / 24) || 1}
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
      },
    });
    const itemsCount = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
    return {
      props: {
        page,
        user: JSON.parse(JSON.stringify(user)),
        itemsCount: itemsCount?._count.items || 0,
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
