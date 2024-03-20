import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type ItemWithImages = Prisma.ItemGetPayload<{
  include: {
    images: true;
  };
}>;

export default function ItemCard({
  item,
  href,
  sold,
}: {
  item: ItemWithImages;
  href: string;
  sold?: boolean;
}) {
  return (
    <Link
      className="relative flex flex-col items-start justify-center"
      href={href}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${item.images[0].id}.${item.images[0].format}`}
          alt={item.name}
          fill={true}
          className="object-cover rounded-md"
        />
        <div className="absolute bg-black/70 text-white bottom-4 pr-4 pl-3 rounded-r-full py-1 font-semibold">
          ¥{item.price.toLocaleString()}
        </div>
      </div>
      <div className="mt-2 text-left">{item.name}</div>
      {sold && (
        <>
          <div className="absolute border-l-[5rem] border-b-[5rem] border-transparent rounded-tl-md border-l-red-500 inline-block left-0 top-0"></div>
          <div className="absolute text-white top-3.5 left-1.5 -rotate-45">
            SOLD
          </div>
        </>
      )}
    </Link>
  );
}
