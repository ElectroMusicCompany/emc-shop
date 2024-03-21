import AdminLayout from "@/components/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { Order } from "@prisma/client";
import { db } from "@/lib/prisma";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { compareAsc } from "date-fns";

export default function AdminOrders({ orders }: { orders: Order[] }) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "購入ユーザー",
      accessorKey: "userId",
    },
    {
      header: "購入商品",
      accessorKey: "itemId",
    },
    {
      header: "支払期日",
      accessorKey: "expiresAt",
    },
    {
      header: "作成日",
      accessorKey: "createdAt",
    },
  ];
  const table = useReactTable({
    columns,
    data: orders,
    getCoreRowModel: getCoreRowModel<Order>(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });
  return (
    <AdminLayout url="order">
      <NextHeadSeo title="注文 - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">注文</h2>
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
                    <td key={cell.id} className="py-2">
                      {i === 0 ? (
                        <Link
                          className="text-sky-500 hover:underline"
                          href={`/adm/orders/${cell.getContext().getValue()}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Link>
                      ) : columns[i]["accessorKey"] === "userId" ? (
                        <Link
                          className="text-sky-500 hover:underline"
                          href={`/adm/users/${cell.getContext().getValue()}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Link>
                      ) : columns[i]["accessorKey"] === "itemId" ? (
                        <Link
                          className="text-sky-500 hover:underline"
                          href={`/adm/items/${cell.getContext().getValue()}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Link>
                      ) : columns[i]["accessorKey"] === "expiresAt" ? (
                        cell.getContext().getValue() ? (
                          compareAsc(
                            new Date(),
                            new Date(cell.getContext().getValue() as string)
                          ) === 1 ? (
                            <p className="text-red-500 font-bold">超過</p>
                          ) : (
                            "未払"
                          )
                        ) : (
                          "支払済み"
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
  const orders = await db.order.findMany({
    orderBy: {
      id: "asc",
    },
    take: 12,
  });
  return {
    props: {
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
};
