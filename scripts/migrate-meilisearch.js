const { PrismaClient } = require("@prisma/client");
const { MeiliSearch } = require("meilisearch");

const prisma = new PrismaClient();
const meili = new MeiliSearch({
  host: "http://localhost:7700",
  apiKey: "masterKey",
});

async function main() {
  const allItems = await prisma.item.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      state: true,
      shipping: true,
      deliveryDays: true,
      points: true,
      price: true,
      order: true,
      images: true,
      createdAt: true,
      _count: {
        select: {
          favorite: true,
        }
      }
    },
  });
  await meili.deleteIndexIfExists("items");
  const index = meili.index("es_items");
  await index.deleteAllDocuments();
  const filtered = allItems.map((item) => {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      state: item.state,
      shipping: item.shipping,
      deliveryDays: item.deliveryDays,
      points: item.points,
      price: item.price,
      order: item.order !== null,
      image: {
        id: item.images[0].id,
        format: item.images[0].format,
      },
      favorites: item._count.favorite,
      createdAt: Math.floor(item.createdAt.getTime() / 1000)
    };
  });
  await index.updateDocuments(filtered);
  await index.updateSortableAttributes(['createdAt', 'price', 'favorites'])
  await index.updateFilterableAttributes(['state', 'shipping', 'points', 'price', 'order'])
}

main()
