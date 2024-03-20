import Link from "next/link";
import Layout from "@/components/Layout";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useRouter } from "next/router";

export default function Complete() {
  const router = useRouter();
  const { itemId, orderId } = router.query;
  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <IoMdCheckmarkCircleOutline size={96} className="text-green-500" />
        <h1 className="text-3xl font-bold py-8">購入が完了しました</h1>
        <p className="text-lg mb-4">{`注文番号: ${orderId}`}</p>
        <p className="text-lg mb-4">{`商品ID: ${itemId}`}</p>
        <p className="text-lg">
          EMC Shopでのご購入ありがとうございます。
          <br />
          出品者が発送準備を進めますので、しばらくお待ちください。
        </p>
        <Link
          href={`/transaction/${orderId}`}
          className="bg-sky-500 text-white px-4 py-2 rounded-md duration-150 hover:bg-sky-600 my-8"
        >
          取引画面へ
        </Link>
      </div>
    </Layout>
  );
}
