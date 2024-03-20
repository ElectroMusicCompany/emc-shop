import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import ItemCard from "@/components/ItemCard";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";

type UserWithItems = Prisma.UserGetPayload<{
  include: {
    favorite: {
      include: {
        item: {
          include: {
            images: true;
            order: true;
          };
        };
      };
    };
  };
}>;

export default function UserPage({ user }: { user: UserWithItems }) {
  const router = useRouter();
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          お気に入り一覧
        </h3>
        {user.favorite.length === 0 && <p>お気に入りした商品はありません。</p>}
        <div className="grid grid-cols-4 gap-4 py-8">
          {user.favorite.map((fav, i) => (
            <ItemCard
              item={fav.item}
              href={`/item/${fav.item.id}`}
              sold={fav.item.order != null}
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
        favorite: {
          include: {
            item: {
              include: {
                images: true,
                order: true,
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
