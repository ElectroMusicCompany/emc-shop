import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";
import type { Prisma } from "@prisma/client";
import { IoMdClose } from "react-icons/io";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import AddressModal from "@/components/AddressModal";
import NextHeadSeo from "next-head-seo";
import { getItemImage } from "@/utils/images";

type ItemWithImages = Prisma.ItemGetPayload<{
  select: {
    id: true;
    price: true;
    name: true;
    stripe: true;
    images: true;
    user: {
      select: {
        id: true;
      };
    };
  };
}>;

type UserWithAddress = Prisma.UserGetPayload<{
  select: {
    id: true;
    address: true;
  };
}>;

export default function Purchase({
  item,
  user,
}: {
  item: ItemWithImages;
  user: UserWithAddress;
}) {
  const [addressModal, setAddressModal] = useState(false);
  const [selectedAddress, setAddress] = useState<String | null>(
    user.address.length > 0 ? user.address[0].id : null
  );
  const router = useRouter();
  return (
    <Layout>
      <NextHeadSeo
        title={`購入 - EMC Shop`}
        description={`${item.name}の購入`}
        canonical={`https://shop.emcmusic.net/purchase/${item.id}`}
        og={{
          title: `購入 - EMC Shop`,
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      {router.query.canceled && (
        <div className="bg-red-200 border border-red-500 text-red-700 rounded-md mb-4">
          <div className="max-w-3xl mx-auto p-4">
            <p className="text-sm">購入がキャンセルされました</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 text-left">
          <div>
            <hr />
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 my-4">
                <Image
                  src={getItemImage(item.images[0].id, item.images[0].format)}
                  alt={item.name}
                  fill={true}
                  className="aspect-square object-cover rounded-md"
                />
              </div>
              <div>
                <p className="mb-2">{item.name}</p>
                <p className="mb-1">
                  <span className="text-sm">¥</span>
                  <span className="text-base font-semibold">
                    {item.price.toLocaleString()}
                  </span>
                  <span className="text-xs">(税込)</span>
                </p>
              </div>
            </div>
            <hr />
          </div>
          <h4 className="text-xl font-semibold mt-8 mb-2">配送先</h4>
          <div>
            <div className="flex flex-col gap-2 py-4">
              {user.address &&
                user.address.map((address, i) => (
                  <div
                    key={address.id}
                    className="flex justify-between items-center gap-2 border-b py-2"
                  >
                    <div className="flex items-center gap-2 grow w-full">
                      <input
                        type="radio"
                        name="address"
                        id={address.id}
                        className="text-sky-500 focus:ring-sky-500"
                        onChange={() => setAddress(address.id)}
                        defaultChecked={
                          JSON.stringify(selectedAddress) ===
                            JSON.stringify(address) || i === 0
                        }
                      />
                      <label htmlFor={address.id} className="grow">
                        <div className="w-full">
                          <p className="mb-2">
                            {address.lastName} {address.firstName}
                          </p>
                          <p className="mb-2">〒{address.zip}</p>
                          <p>{`${address.state} ${address.city} ${
                            address.street
                          } ${address.building || ""}`}</p>
                        </div>
                      </label>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/user/deleteAddress", {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            id: address.id,
                          }),
                        });
                        if (selectedAddress === address.id) {
                          const currentAddress = user.address.filter(
                            (a) => a.id !== address.id
                          );
                          if (currentAddress.length == 0) {
                            setAddress(null);
                          } else {
                            setAddress(currentAddress[0].id);
                          }
                        }
                        router.replace(router.asPath);
                      }}
                    >
                      <IoMdClose size={20} />
                    </button>
                  </div>
                ))}
            </div>
            <button
              className="w-full bg-sky-500 text-white py-2 rounded-md duration-150 hover:bg-sky-600"
              onClick={() => {
                setAddressModal(true);
              }}
            >
              住所を追加
            </button>
            <AddressModal
              open={addressModal}
              setOpen={setAddressModal}
              setAddress={async (data) => {
                const ad = await (
                  await fetch("/api/user/addAddress", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      ...data,
                    }),
                  })
                ).json();
                if (ad.status === "success") {
                  const currentAddress = [...user.address, ad.address];
                  if (currentAddress.length === 1) {
                    setAddress(currentAddress[0].id);
                  }
                }
                router.replace(router.asPath);
              }}
            />
          </div>
        </div>
        <div>
          <div className="border">
            <div className="p-4">
              <div className="flex justify-between pb-4">
                <p>商品代金</p>
                <p>¥{item.price}</p>
              </div>
              <hr />
              <div className="flex justify-between py-4">
                <p>支払い金額</p>
                <p>¥{item.price}</p>
              </div>
              <div className="flex justify-between">
                <p>支払い方法</p>
                <p>{item.stripe ? "Stripe" : "購入者に連絡"}</p>
              </div>
            </div>
          </div>
          <button
            className="w-full bg-sky-500 text-white py-2 rounded-md mt-4 duration-150 hover:bg-sky-600 disabled:bg-gray-400"
            disabled={!selectedAddress}
            onClick={async () => {
              const red = await (
                await fetch(
                  `/api/item/purchase?itemId=${item.id}&buyerId=${user.id}&addressId=${selectedAddress}`
                )
              ).json();
              if (red.status === "success") {
                window.location.href = red.redirect;
              }
            }}
          >
            購入を確定する
          </button>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    const itemId = ctx.params?.itemId as string;
    const item = await db.item.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        images: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        address: true,
      },
    });
    if (user?.id === item?.user.id) {
      return {
        redirect: {
          destination: `/item/${item?.id}`,
          permanent: false,
        },
      };
    }
    return {
      props: {
        item: JSON.parse(JSON.stringify(item)),
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  }
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};
