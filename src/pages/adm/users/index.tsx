import AdminLayout from "@/components/admin/AdminLayout";
import NextHeadSeo from "next-head-seo";
import { GetServerSideProps } from "next";
import { User } from "@prisma/client";
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
import AdminPagination from "@/components/admin/AdminPagination";

export default function AdminItems({
  page,
  users,
  usersCount,
}: {
  page: number;
  users: User[];
  usersCount: number;
}) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "ユーザー名",
      accessorKey: "name",
    },
    {
      header: "Stripe ID",
      accessorKey: "stripeId",
    },
    {
      header: "ポイント",
      accessorKey: "points",
    },
    {
      header: "管理者",
      accessorKey: "admin",
    },
    {
      header: "凍結",
      accessorKey: "suspended",
    },
    {
      header: "作成日",
      accessorKey: "createdAt",
    },
  ];
  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel<User>(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });
  return (
    <AdminLayout url="user">
      <NextHeadSeo title="ユーザー - EMC Shop Admin" />
      <h2 className="text-2xl font-bold">ユーザー</h2>
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
                            href={`/adm/users/${cell.getContext().getValue()}`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
                        ) : columns[i]["accessorKey"] === "admin" ? (
                          cell.getContext().getValue() === true ? (
                            "◯"
                          ) : (
                            "×"
                          )
                        ) : columns[i]["accessorKey"] === "suspended" ? (
                          cell.getContext().getValue() === true ? (
                            "◯"
                          ) : (
                            "×"
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
        count={Math.floor(usersCount / 24) || 1}
        page={page}
        path="users"
      />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const page = ctx.query.page ? Number(ctx.query.page) : 1;
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
  const users = await db.user.findMany({
    orderBy: {
      id: "desc",
    },
    take: 24 * page,
    skip: 24 * (page - 1),
  });
  const usersCount = await db.user.count();
  if (!users) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      page,
      usersCount,
      users: JSON.parse(JSON.stringify(users)),
    },
  };
};
