import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { Noto_Sans_JP } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { signIn, useSession } from "next-auth/react";
import { Transition, Menu } from "@headlessui/react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import {
  MdOutlineDashboard,
  MdPersonOutline,
  MdOutlineAlbum,
  MdOutlinePayments,
  MdOutlineFlag,
} from "react-icons/md";

const notoSansJp = Noto_Sans_JP({ subsets: ["latin"] });

export default function AdminLayout({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  return (
    <div
      className={twMerge(
        "relative flex flex-col items-center lg:flex-row lg:items-start justify-center min-h-screen",
        notoSansJp.className
      )}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <aside className="whitespace-nowrap flex flex-col justify-center bg-white lg:h-screen">
        <div className="mx-auto flex flex-col items-start justify-between lg:pl-4 lg:pr-8 py-4">
          <h2 className="text-lg font-medium lg:mb-4">
            <Link href="/adm/">EMC Shop Admin</Link>
          </h2>
        </div>
        <div className="grow flex flex-row lg:flex-col gap-1 w-full px-2 text-sm">
          <Link
            href="/adm/"
            className={twMerge(
              "flex gap-1 items-center justify-center lg:justify-start rounded-md w-full px-4 py-2 duration-150",
              url === "index" ? "bg-sky-100 text-sky-500" : "hover:bg-gray-100"
            )}
          >
            <MdOutlineDashboard size={20} />
            <p className="hidden lg:block">ダッシュボード</p>
          </Link>
          <Link
            href="/adm/users"
            className={twMerge(
              "flex gap-1 items-center justify-center lg:justify-start rounded-md w-full px-4 py-2 duration-150",
              url === "user" ? "bg-sky-100 text-sky-500" : "hover:bg-gray-100"
            )}
          >
            <MdPersonOutline size={20} />
            <p className="hidden lg:block">ユーザー</p>
          </Link>
          <Link
            href="/adm/items"
            className={twMerge(
              "flex gap-1 items-center justify-center lg:justify-start rounded-md w-full px-4 py-2 duration-150",
              url === "item" ? "bg-sky-100 text-sky-500" : "hover:bg-gray-100"
            )}
          >
            <MdOutlineAlbum size={20} />
            <p className="hidden lg:block">商品</p>
          </Link>
          <Link
            href="/adm/orders"
            className={twMerge(
              "flex gap-1 items-center justify-center lg:justify-start rounded-md w-full px-4 py-2 duration-150",
              url === "order" ? "bg-sky-100 text-sky-500" : "hover:bg-gray-100"
            )}
          >
            <MdOutlinePayments size={20} />
            <p className="hidden lg:block">注文</p>
          </Link>
          <Link
            href="/adm/reports"
            className={twMerge(
              "flex gap-1 items-center justify-center lg:justify-start rounded-md w-full px-4 py-2 duration-150",
              url === "report" ? "bg-sky-100 text-sky-500" : "hover:bg-gray-100"
            )}
          >
            <MdOutlineFlag size={20} />
            <p className="hidden lg:block">通報</p>
          </Link>
        </div>
      </aside>
      <main className="bg-gray-100 w-full">
        <header className="bg-white py-4">
          <div className="relative flex items-center justify-end px-8">
            {session ? (
              <Menu>
                <Menu.Button>
                  <Image
                    src={session.user?.image || ""}
                    alt={session.user?.name || ""}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="z-50 absolute right-8 top-8 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/`}
                            className={twMerge(
                              "block px-4 py-2 rounded-md text-sm duration-100",
                              active ? "bg-gray-100" : ""
                            )}
                          >
                            EMC Shopに戻る
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/api/auth/signout"
                            className={twMerge(
                              "block px-4 py-2 rounded-md text-sm duration-100",
                              active ? "bg-gray-100" : ""
                            )}
                          >
                            ログアウト
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button onClick={() => signIn("discord")}>ログイン</button>
            )}
          </div>
        </header>
        <div className="min-h-screen px-8 py-6 max-w-7xl mx-auto">
          {children}
        </div>
        <footer className="bg-white border-t w-full">
          <div className="mx-auto flex items-start justify-between max-w-7xl px-4 py-4">
            <p>Powered by EMC</p>
            <div className="flex flex-col text-sm gap-1">
              <Link href="/disclosure">特定商取引法に基づく表記</Link>
              <Link href="/tos">利用規約</Link>
              <Link href="/privacy">プライバシーポリシー</Link>
            </div>
          </div>
        </footer>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
