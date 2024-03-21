import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
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

export default function AdminItems({ reports }: { reports: Report[] }) {
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
      header: "取引ID",
      accessorKey: "orderId",
    },
    {
      header: "作成日",
      accessorKey: "createdAt",
    },
  ];
  const table = useReactTable({
    columns,
    data: reports,
    getCoreRowModel: getCoreRowModel<Report>(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <AdminLayout url="report">
      <NextHeadSeo title="通報 - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">通報</h2>
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
                            href={`/adm/reports/${cell
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
                        ) : columns[i]["accessorKey"] === "orderId" ? (
                          <Link
                            className="text-sky-500 hover:underline"
                            href={`/adm/orders/${cell.getContext().getValue()}`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
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
  const reports = await db.report.findMany({
    orderBy: {
      id: "desc",
    },
    take: 24,
    skip: 24 * (page - 1),
  });
  if (!reports) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      reports: JSON.parse(JSON.stringify(reports)),
    },
  };
};
