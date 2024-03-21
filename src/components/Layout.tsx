import Head from "next/head";
import Image from "next/image";
import { Fragment } from "react";
import { Noto_Sans_JP } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { signIn, useSession } from "next-auth/react";
import { Transition, Menu } from "@headlessui/react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

const notoSansJp = Noto_Sans_JP({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <div
      className={twMerge(
        "flex flex-col items-center justify-center min-h-screen",
        notoSansJp.className
      )}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="border-b w-full">
        <div className="mx-auto flex items-center justify-between max-w-7xl px-4 py-4">
          <h2 className="text-lg font-medium">
            <Link href="/">EMC Shop</Link>
          </h2>

          <div className="relative flex items-center space-x-4">
            {session ? (
              <>
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
                    <Menu.Items className="z-50 absolute right-16 top-8 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={`/mypage`}
                              className={twMerge(
                                "block px-4 py-2 rounded-md text-sm duration-100",
                                active ? "bg-gray-100" : ""
                              )}
                            >
                              マイページ
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={`/user/profile/${session.user?.id}`}
                              className={twMerge(
                                "block px-4 py-2 rounded-md text-sm duration-100",
                                active ? "bg-gray-100" : ""
                              )}
                            >
                              プロフィール
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
                <Link
                  href="/sell"
                  className="bg-sky-500 font-medium text-white px-4 py-1.5 text-sm rounded-md duration-150 hover:opacity-80"
                >
                  出品
                </Link>
              </>
            ) : (
              <button onClick={() => signIn("discord")}>ログイン</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full py-8 min-h-screen px-4 md:px-20">
        {children}
      </main>
      <Toaster position="bottom-right" />

      <footer className="border-t w-full">
        <div className="mx-auto flex items-start justify-between max-w-7xl px-4 py-4">
          <p>Powered by EMC</p>
          <div className="flex flex-col text-sm gap-1">
            <Link href="/disclosure">特定商取引法に基づく表記</Link>
            <Link href="/tos">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/info">このソフトウェアについて</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
