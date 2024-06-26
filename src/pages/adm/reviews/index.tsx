import AdminLayout from "@/components/admin/AdminLayout";
import AdminPagination from "@/components/admin/AdminPagination";
import { db } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Review } from "@prisma/client";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import NextHeadSeo from "next-head-seo";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function AdminItems({
  page,
  reviews,
  reviewsCount,
}: {
  page: number;
  reviews: Review[];
  reviewsCount: number;
}) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "ユーザーID",
      accessorKey: "userId",
    },
    {
      header: "商品ID",
      accessorKey: "itemId",
    },
    {
      header: "購入者?",
      accessorKey: "buyer",
    },
    {
      header: "評価",
      accessorKey: "rating",
    },
    {
      header: "作成日",
      accessorKey: "createdAt",
    },
  ];
  const table = useReactTable({
    columns,
    data: reviews,
    getCoreRowModel: getCoreRowModel<Report>(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <AdminLayout url="review">
      <NextHeadSeo title="レビュー - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">レビュー</h2>
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
                            href={`/adm/reviews/${cell
                              .getContext()
                              .getValue()}`}
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
                        ) : columns[i]["accessorKey"] === "buyer" ? (
                          cell.getContext().getValue() === true ? (
                            "◯"
                          ) : (
                            "×"
                          )
                        ) : columns[i]["accessorKey"] === "rating" ? (
                          cell.getContext().getValue() === true ? (
                            "良"
                          ) : (
                            "悪"
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
      </div>
      <AdminPagination
        count={Math.floor(reviewsCount / 24) || 1}
        page={page}
        path="reviews"
      />
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
  const reviews = await db.review.findMany({
    orderBy: {
      id: "desc",
    },
    take: 24,
    skip: 24 * (page - 1),
  });
  if (!reviews) {
    return {
      notFound: true,
    };
  }
  const reviewsCount = await db.review.count();
  return {
    props: {
      page,
      reviews: JSON.parse(JSON.stringify(reviews)),
      reviewsCount,
    },
  };
};
