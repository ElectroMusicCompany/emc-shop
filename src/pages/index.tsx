import Layout from "@/components/Layout";
import ItemCard from "@/components/ItemCard";
import { GetServerSideProps } from "next";
import { db } from "@/lib/prisma";
import NextHeadSeo from "next-head-seo";
import { Prisma } from "@prisma/client";

type ItemWithImages = Prisma.ItemGetPayload<{
  include: {
    images: true;
    order: true;
  };
}>;

export default function Home({ items }: { items: ItemWithImages[] }) {
  return (
    <Layout>
      <NextHeadSeo
        title="EMC Shop"
        description="EMCが運営するフリーマーケット"
        canonical={`https://shop.emcmusic.net/`}
        og={{
          title: "EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <h3 className="text-xl font-bold text-left py-4">最新の出品</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.length > 0 ? (
          items.map((item, i) => (
            <ItemCard
              item={item}
              href={`/item/${item.id}`}
              sold={item.order != null}
              key={i}
            />
          ))
        ) : (
          <p>出品がありません</p>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const items = await db.item.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: true,
      order: true,
    },
    take: 24,
  });
  return {
    props: {
      items: JSON.parse(JSON.stringify(items)),
    },
  };
};
