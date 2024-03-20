import { db } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";
import Layout from "@/components/Layout";
import { IoMdClose, IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import { useState } from "react";
import AddressModal from "@/components/AddressModal";
import toast from "react-hot-toast";
import NextHeadSeo from "next-head-seo";

type UserWithAddresses = Prisma.UserGetPayload<{
  include: { address: true };
}>;

export default function MyPageAddresses({ user }: { user: UserWithAddresses }) {
  const [selectedAddress, setAddress] = useState<String | null>();
  const [addressModal, setAddressModal] = useState(false);
  const router = useRouter();
  return (
    <Layout>
      <NextHeadSeo
        title="住所一覧 - EMC Shop"
        description="住所一覧"
        canonical={`https://shop.emcmusic.net/mypage/addresses`}
        og={{
          title: "住所一覧 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="max-w-3xl mx-auto text-left">
        <h3 className="text-xl font-bold py-2 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <IoMdArrowBack size={24} />
          </button>
          住所一覧
        </h3>
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
                      <p>{`${address.state} ${address.city} ${address.street} ${
                        address.building || ""
                      }`}</p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={async () => {
                    const loading = toast.loading("削除中...");
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
                    toast.success("削除しました", {
                      id: loading,
                    });
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
            const loading = toast.loading("保存中...");
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
              toast.success("保存しました", {
                id: loading,
              });
              router.replace(router.asPath);
            }
            router.replace(router.asPath);
          }}
        />
      </div>
    </Layout>
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
    where: { id: session.user.id },
    include: { address: true },
  });
  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};
