import { getItemImage } from "@/utils/images";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type ItemWithImages = Prisma.ItemGetPayload<{
  select: {
    id: true;
    name: true;
    price: true;
    images: true;
  };
}>;

type SearchItem = {
  id: number;
  name: string;
  price: number;
  image: {
    id: string;
    format: string;
  };
  order: boolean;
};

export default function ItemCard({
  item,
  href,
  sold,
}: {
  item: ItemWithImages | SearchItem;
  href: string;
  sold?: boolean;
}) {
  if ("image" in item) {
    return (
      <Link
        className="relative flex flex-col items-start justify-center"
        href={href}
      >
        <div className="relative w-full aspect-square">
          <Image
            src={getItemImage(item.image.id, item.image.format)}
            alt={item.name}
            fill={true}
            className="object-cover rounded-md"
          />
          <div className="absolute bg-black/70 text-white bottom-4 pr-4 pl-3 rounded-r-full py-1 font-semibold">
            ¥{item.price.toLocaleString()}
          </div>
        </div>
        <div className="mt-2 text-left">{item.name}</div>
        {item.order && (
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
  return (
    <Link
      className="relative flex flex-col items-start justify-center"
      href={href}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={getItemImage(item.images[0].id, item.images[0].format)}
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
