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
    favorite: {
      select: {
        item: {
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
    };
  };
}>;

export default function UserPage({
  user,
  page,
  favoritesCount,
}: {
  user: UserWithItems;
  page: number;
  favoritesCount: number;
}) {
  const router = useRouter();
  return (
    <Layout>
      <NextHeadSeo
        title="お気に入り商品一覧 - EMC Shop"
        description="お気に入り商品一覧"
        canonical={`https://shop.emcmusic.net/mypage/favorites`}
        og={{
          title: "お気に入り商品一覧 - EMC Shop",
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
          お気に入り一覧
        </h3>
        {user.favorite.length === 0 && <p>お気に入りした商品はありません。</p>}
        <div className="items-start grid grid-cols-4 gap-4 py-8">
          {user.favorite.map((fav, i) => (
            <ItemCard
              item={fav.item}
              href={`/item/${fav.item.id}`}
              sold={fav.item.order != null}
              key={i}
            />
          ))}
        </div>
        <Pagination
          path="/mypage/favorites"
          page={page}
          count={Math.floor(favoritesCount / 24) || 1}
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
        favorite: {
          select: {
            item: {
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
            },
          },
          take: 24 * page,
          skip: 24 * (page - 1),
        },
      },
    });
    const favoritesCount = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        _count: {
          select: {
            favorite: true,
          },
        },
      },
    });
    return {
      props: {
        page,
        user: JSON.parse(JSON.stringify(user)),
        favoritesCount: favoritesCount?._count.favorite || 0,
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
