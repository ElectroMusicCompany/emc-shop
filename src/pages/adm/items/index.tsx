import AdminLayout from "@/components/admin/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { Item, Order } from "@prisma/client";
import { db } from "@/lib/prisma";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { access } from "fs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import AdminPagination from "@/components/admin/AdminPagination";

export default function AdminItems({
  page,
  items,
  itemsCount,
}: {
  page: number;
  items: Item[];
  itemsCount: number;
}) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "商品名",
      accessorKey: "name",
    },
    {
      header: "価格",
      accessorKey: "price",
    },
    {
      header: "配送方法",
      accessorKey: "shipping",
    },
    {
      header: "購入",
      accessorKey: "order",
    },
    {
      header: "作成日",
      accessorKey: "createdAt",
    },
  ];
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel<Item>(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });
  return (
    <AdminLayout url="item">
      <NextHeadSeo title="ユーザー - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">商品</h2>
      <div className="overflow-x-scroll">
        <table className="w-full my-4">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={twMerge(
                      "bg-white py-2",
                      i === 0 && "rounded-tl-md",
                      i === headerGroup.headers.length - 1 && "rounded-tr-md"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id} className="text-center bg-white border-t">
                  {row.getVisibleCells().map((cell, i) => {
                    return (
                      <td key={cell.id} className="py-2 px-4 whitespace-nowrap">
                        {i === 0 ? (
                          <Link
                            className="text-sky-500 hover:underline"
                            href={`/adm/items/${cell.getContext().getValue()}`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
                        ) : columns[i]["accessorKey"] === "order" ? (
                          cell.getContext().getValue() ? (
                            <Link
                              className="text-sky-500 hover:underline"
                              href={`/adm/orders/${
                                (cell.getContext().getValue() as Order).id
                              }`}
                            >
                              済
                            </Link>
                          ) : (
                            "未"
                          )
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <AdminPagination
          count={Math.floor(itemsCount / 24) || 1}
          page={page}
          path="users"
        />
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!user?.admin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const page = ctx.query.page ? Number(ctx.query.page) : 1;
  const items = await db.item.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      order: true,
    },
    take: 24 * page,
    skip: 24 * (page - 1),
  });
  if (!items) {
    return {
      notFound: true,
    };
  }
  const itemsCount = await db.item.count();
  return {
    props: {
      page,
      items: JSON.parse(JSON.stringify(items)),
      itemsCount,
    },
  };
};
