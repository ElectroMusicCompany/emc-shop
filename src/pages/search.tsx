import Layout from "@/components/Layout";
import ItemCard from "@/components/ItemCard";
import NextHeadSeo from "next-head-seo";
import { Prisma } from "@prisma/client";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/prisma";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import Pagination from "@/components/Pagination";
import { search } from "@/lib/meilisearch";
import {
  categories,
  categoryToId,
  getParentCategory,
  getSubcategories,
  hasSubcategories,
  idToCategory,
} from "@/lib/category";
import { set } from "date-fns";

type SearchItem = {
  id: number;
  name: string;
  price: number;
  image: {
    id: string;
    format: string;
  };
  order: boolean;
};

type sortType = {
  [key: string]: {
    order: Prisma.SortOrder;
    sort: string;
  };
};

export default function Search({
  items,
  page,
  itemsCount,
}: {
  items: SearchItem[];
  page: number;
  itemsCount: number;
}) {
  const router = useRouter();
  const [onsale, setOnsale] = useState(false);
  const [sortState, setSortState] = useState("new");
  const [accordion, setAccordion] = useState({
    price: false,
    condition: false,
    onsale: false,
    category_id: false,
  });
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [category, setCategory] = useState<string[]>([]);
  const typewatch = (function () {
    let timer: number | NodeJS.Timeout = 0;
    return function (callback: () => void, ms: number) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();
  const sorts: sortType = {
    new: {
      order: "desc",
      sort: "created_time",
    },
    price_asc: {
      order: "asc",
      sort: "price",
    },
    price_desc: {
      order: "desc",
      sort: "price",
    },
    like: {
      order: "desc",
      sort: "num_likes",
    },
  };
  useEffect(() => {
    if (router.query.status === "on_sale") {
      setOnsale(true);
      setAccordion((prev) => ({ ...prev, onsale: true }));
    }
    if (router.query.sort) {
      setSortState(
        Object.keys(sorts).find(
          (key) =>
            sorts[key].sort === router.query.sort &&
            sorts[key].order === router.query.order
        ) || "new"
      );
    }
    if (router.query.price_min || router.query.price_max) {
      setAccordion((prev) => ({ ...prev, price: true }));
    }
    if (router.query.item_condition_id) {
      setAccordion((prev) => ({ ...prev, condition: true }));
    }
    if (router.query.price_min) {
      setPriceMin(Number(router.query.price_min));
    }
    if (router.query.price_max) {
      setPriceMax(Number(router.query.price_max));
    }
    if (router.query.category_id) {
      setAccordion((prev) => ({ ...prev, category_id: true }));
      setCategory(idToCategory(Number(router.query.category_id.toString())));
    }
  }, []);
  return (
    <Layout searchText={router.query.keyword?.toString()}>
      <NextHeadSeo
        title={
          router.query.keyword
            ? `${router.query.keyword}の検索結果 - EMC Shop`
            : "検索 - EMC Shop"
        }
        description="商品を検索しましょう"
        canonical="https://shop.emcmusic.net/search"
        og={{
          title: router.query.keyword
            ? `${router.query.keyword}の検索結果 - EMC Shop`
            : "検索 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">絞り込み</h3>
            <button
              className="text-sm text-sky-500 duration-100 hover:text-sky-600"
              onClick={() => {
                const keyword = router.query.keyword;
                setOnsale(false);
                setSortState("new");
                router.push({
                  pathname: router.pathname,
                  query: {
                    keyword,
                  },
                });
              }}
            >
              クリア
            </button>
          </div>
          <hr />
          <div className="py-3 border-b">
            <button
              className="w-full flex justify-between items-center"
              onClick={() =>
                setAccordion((prev) => ({
                  ...prev,
                  price: !prev.price,
                }))
              }
            >
              <p className="w-full text-left font-bold">価格</p>
              {accordion.price ? (
                <MdKeyboardArrowUp size={28} />
              ) : (
                <MdKeyboardArrowDown size={28} />
              )}
            </button>
            <div
              className={twMerge(
                "items-center justify-between mt-2",
                accordion.price ? "flex" : "hidden"
              )}
            >
              <input
                type="number"
                placeholder="¥300"
                className="w-full rounded no-spin focus:ring-sky-500 focus:border-sky-500"
                value={priceMin || ""}
                onKeyUp={(e) => {
                  typewatch(() => {
                    if (priceMin) {
                      const query = router.query;
                      query.price_min = priceMin?.toString();
                      router.push({
                        pathname: router.pathname,
                        query: query,
                      });
                    } else {
                      const query = router.query;
                      delete query.price_min;
                      router.push({
                        pathname: router.pathname,
                        query: query,
                      });
                    }
                  }, 700);
                }}
                onChange={(e) => {
                  setPriceMin(Number(e.target.value));
                }}
              />
              <p className="px-4">-</p>
              <input
                type="number"
                placeholder="¥9,999,999"
                className="w-full rounded no-spin focus:ring-sky-500 focus:border-sky-500"
                value={priceMax || ""}
                onKeyUp={(e) => {
                  typewatch(() => {
                    if (priceMax) {
                      const query = router.query;
                      query.price_max = priceMax?.toString();
                      router.push({
                        pathname: router.pathname,
                        query: query,
                      });
                    } else {
                      const query = router.query;
                      delete query.price_max;
                      router.push({
                        pathname: router.pathname,
                        query: query,
                      });
                    }
                  }, 700);
                }}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div className="py-3 border-b">
            <button
              className="w-full flex justify-between items-center"
              onClick={() =>
                setAccordion((prev) => ({
                  ...prev,
                  condition: !prev.condition,
                }))
              }
            >
              <p className="w-full text-left font-bold">商品の状態</p>
              {accordion.condition ? (
                <MdKeyboardArrowUp size={28} />
              ) : (
                <MdKeyboardArrowDown size={28} />
              )}
            </button>
            <div
              className={twMerge(
                "items-center justify-between mt-2",
                accordion.condition ? "flex" : "hidden"
              )}
            >
              <select
                className="w-full rounded focus:ring-sky-500 focus:border-sky-500"
                value={router.query.item_condition_id || ""}
                onChange={(e) => {
                  const query = router.query;
                  query.item_condition_id = e.target.value;
                  router.push({
                    pathname: router.pathname,
                    query: query,
                  });
                }}
              >
                <option value="">全て</option>
                <option value="0">新品、未使用</option>
                <option value="1">未使用に近い</option>
                <option value="2">目立った傷や汚れなし</option>
                <option value="3">やや傷や汚れあり</option>
                <option value="4">傷や汚れあり</option>
                <option value="5">全体的に状態が悪い</option>
              </select>
            </div>
          </div>
          <div className="py-3 border-b">
            <button
              className="w-full flex justify-between items-center"
              onClick={() =>
                setAccordion((prev) => ({
                  ...prev,
                  category_id: !prev.category_id,
                }))
              }
            >
              <p className="w-full text-left font-bold">カテゴリー</p>
              {accordion.category_id ? (
                <MdKeyboardArrowUp size={28} />
              ) : (
                <MdKeyboardArrowDown size={28} />
              )}
            </button>
            <div
              className={twMerge(
                "items-center justify-between mt-2",
                accordion.category_id ? "flex" : "hidden"
              )}
            >
              <select
                className="w-full rounded focus:ring-sky-500 focus:border-sky-500"
                value={categoryToId(category[0]) || ""}
                onChange={(e) => {
                  const query = router.query;
                  query.category_id = e.target.value;
                  if (e.target.value === "") {
                    delete query.category_id;
                  }
                  setCategory(idToCategory(Number(e.target.value)));
                  router.push({
                    pathname: router.pathname,
                    query: query,
                  });
                }}
              >
                <option value="">全て</option>
                {Object.keys(categories).map((id, i) => (
                  <option key={i} value={id}>
                    {categories[Number(id)]}
                  </option>
                ))}
              </select>
            </div>
            {(category.length > 1 ||
              hasSubcategories(Number(categoryToId(category[0])))) && (
              <div
                className={twMerge(
                  "items-center justify-between mt-2",
                  accordion.category_id ? "flex" : "hidden"
                )}
              >
                <select
                  className="w-full rounded focus:ring-sky-500 focus:border-sky-500"
                  value={categoryToId(category[1]) || ""}
                  onChange={(e) => {
                    const query = router.query;
                    query.category_id = e.target.value;
                    if (e.target.value === "") {
                      if (
                        getParentCategory(Number(categoryToId(category[1]))) ===
                        0
                      ) {
                        delete query.category_id;
                        setCategory([]);
                      } else {
                        query.category_id = getParentCategory(
                          Number(categoryToId(category[1]))
                        ).toString();
                        setCategory(
                          idToCategory(
                            getParentCategory(Number(categoryToId(category[1])))
                          )
                        );
                      }
                    } else {
                      setCategory(idToCategory(Number(e.target.value)));
                    }
                    router.push({
                      pathname: router.pathname,
                      query: query,
                    });
                  }}
                >
                  <option value="">全て</option>
                  {getSubcategories(categoryToId(category[0])).map((id, i) => (
                    <option key={i} value={id}>
                      {idToCategory(id)[1]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(category.length > 2 ||
              hasSubcategories(Number(categoryToId(category[1])))) && (
              <div
                className={twMerge(
                  "items-center justify-between mt-2",
                  accordion.category_id ? "flex" : "hidden"
                )}
              >
                <select
                  className="w-full rounded focus:ring-sky-500 focus:border-sky-500"
                  value={categoryToId(category[2]) || ""}
                  onChange={(e) => {
                    const query = router.query;
                    query.category_id = e.target.value;
                    if (e.target.value === "") {
                      if (
                        getParentCategory(Number(categoryToId(category[2]))) ===
                        0
                      ) {
                        delete query.category_id;
                        setCategory([]);
                      } else {
                        query.category_id = getParentCategory(
                          Number(categoryToId(category[2]))
                        ).toString();
                        setCategory(
                          idToCategory(
                            getParentCategory(Number(categoryToId(category[2])))
                          )
                        );
                      }
                    } else {
                      setCategory(idToCategory(Number(e.target.value)));
                    }
                    router.push({
                      pathname: router.pathname,
                      query: query,
                    });
                  }}
                >
                  <option value="">全て</option>
                  {getSubcategories(categoryToId(category[1])).map((id, i) => (
                    <option key={i} value={id}>
                      {idToCategory(id)[2]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="py-3 border-b">
            <button
              className="w-full flex justify-between items-center"
              onClick={() =>
                setAccordion((prev) => ({
                  ...prev,
                  onsale: !prev.onsale,
                }))
              }
            >
              <p className="w-full text-left font-bold">販売状況</p>
              {accordion.onsale ? (
                <MdKeyboardArrowUp size={28} />
              ) : (
                <MdKeyboardArrowDown size={28} />
              )}
            </button>
            <div
              className={twMerge(
                "items-center mt-2",
                accordion.onsale ? "flex" : "hidden"
              )}
            >
              <input
                type="checkbox"
                id="all"
                name="all"
                className="mr-2 rounded text-sky-500 focus:ring-sky-500"
                checked={!onsale}
                onChange={(e) => {
                  const query = router.query;
                  delete query.status;
                  setOnsale(false);
                  router.push({
                    pathname: router.pathname,
                    query: query,
                  });
                }}
              />
              <label htmlFor="all">すべて</label>
            </div>
            <div
              className={twMerge(
                "items-center mt-2",
                accordion.onsale ? "flex" : "hidden"
              )}
            >
              <input
                type="checkbox"
                id="onsale"
                name="onsale"
                className="mr-2 rounded text-sky-500 focus:ring-sky-500"
                checked={onsale}
                onChange={(e) => {
                  const query = router.query;
                  if (e.target.checked) {
                    query.status = "on_sale";
                  } else {
                    delete query.status;
                  }
                  setOnsale(e.target.checked);
                  router.push({
                    pathname: router.pathname,
                    query: query,
                  });
                }}
              />
              <label htmlFor="onsale">販売中</label>
            </div>
          </div>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold">
            {router.query.keyword
              ? `${router.query.keyword} の検索結果`
              : "検索結果"}
          </h2>
          <div className="flex justify-between my-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="on_sale"
                name="on_sale"
                className="mr-2 rounded text-sky-500 focus:ring-sky-500"
                checked={onsale}
                onChange={(e) => {
                  const query = router.query;
                  if (e.target.checked) {
                    query.status = "on_sale";
                  } else {
                    delete query.status;
                  }
                  setOnsale(e.target.checked);
                  router.push({
                    pathname: router.pathname,
                    query: query,
                  });
                }}
              />
              <label htmlFor="on_sale">販売中のみ表示</label>
            </div>
            <select
              className="rounded text-sky-500 border-0 focus:ring-0 hover:bg-sky-100 duration-150"
              value={sortState}
              onChange={(e) => {
                const value = e.target.value;
                const query = router.query;
                const { sort, order } = sorts[value];
                setSortState(value);
                query.sort = sort;
                query.order = order;
                router.push({
                  pathname: router.pathname,
                  query: query,
                });
              }}
            >
              <option value="new">新着順</option>
              <option value="price_asc">価格の安い順</option>
              <option value="price_desc">価格の高い順</option>
              <option value="like">人気順</option>
            </select>
          </div>
          <div className="grid grid-cols-2 items-start md:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.length > 0 ? (
              items.map((item, i) => (
                <ItemCard
                  item={item}
                  href={`/item/${item.id}`}
                  sold={item.order}
                  key={i}
                />
              ))
            ) : (
              <p>出品がありません</p>
            )}
          </div>
          <Pagination
            path=""
            page={page}
            count={Math.floor(itemsCount / 24) || 1}
          />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await search
    .index("es_items")
    .updateFilterableAttributes([
      "state",
      "shipping",
      "points",
      "price",
      "order",
      "category",
    ]);
  await search
    .index("es_items")
    .updateSortableAttributes(["price", "createdAt", "favorites"]);
  await search
    .index("es_items")
    .updateSearchableAttributes(["name", "description"]);
  const {
    keyword,
    status,
    price_min,
    price_max,
    item_condition_id,
    category_id,
    sort,
    order = "desc",
    page = 1,
  } = ctx.query;
  const wh: string[] = [];
  const ct: string[] = [];
  const or: string[] = [];
  if (status === "on_sale") {
    wh.push("order IS NULL");
  }
  if (price_min) {
    wh.push(`price >= ${price_min}`);
  }
  if (price_max) {
    wh.push(`price <= ${price_max}`);
  }
  if (item_condition_id) {
    const state = [
      "新品、未使用",
      "未使用に近い",
      "目立った傷や汚れなし",
      "やや傷や汚れあり",
      "傷や汚れあり",
      "全体的に状態が悪い",
    ];
    wh.push(`state = "${state[Number(item_condition_id.toString())]}"`);
  }
  if (category_id) {
    ct.push(category_id.toString());
    if (hasSubcategories(Number(category_id))) {
      getSubcategories(Number(category_id)).forEach((id) => {
        ct.push(id.toString());
      });
    }
  }
  if (!sort || sort === "created_time") {
    or.push("createdAt:desc");
  }
  if (sort === "price") {
    or.push(`price:${order}`);
  }
  if (sort === "num_likes") {
    or.push(`favorites:desc`);
  }
  const items = await search.index("es_items").search(keyword as string, {
    filter: `${wh.join(" AND ")}${
      ct.length != 0 && wh.length != 0 ? " AND " : ""
    }${ct.length != 0 ? `category IN [${ct.join(", ")}]` : ""}`,
    attributesToRetrieve: ["id", "name", "price", "image", "order"],
    attributesToHighlight: [],
    attributesToCrop: [],
    limit: 24 * Number(page),
    offset: 24 * (Number(page) - 1),
    sort: or,
  });
  const itemsCount = items.estimatedTotalHits;
  if (!items) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
      items: JSON.parse(JSON.stringify(items.hits)),
      itemsCount,
    },
  };
};
