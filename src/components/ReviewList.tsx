import { Prisma } from "@prisma/client";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { getAvatar } from "@/utils/images";

type Review = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    text: true;
    rating: true;
    user: {
      select: {
        id: true;
        name: true;
        avatar: true;
      };
    };
    createdAt: true;
    buyer: true;
  };
}>;

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(0);
  const good = reviews.filter((review) => review.rating);
  const bad = reviews.filter((review) => !review.rating);
  return (
    <div>
      <div className="mb-4">
        <button
          className={twMerge(
            "border-b-2 px-6 py-2 font-semibold duration-150",
            page === 0 && "border-sky-500 text-sky-500 bg-sky-100"
          )}
          onClick={() => setPage(0)}
        >
          良かった ({good.length})
        </button>
        <button
          className={twMerge(
            "border-b-2 px-6 py-2 font-semibold duration-150",
            page === 1 && "border-sky-500 text-sky-500 bg-sky-100"
          )}
          onClick={() => setPage(1)}
        >
          悪かった ({bad.length})
        </button>
      </div>
      <div>
        {page === 0 && good.length > 0 ? (
          good.map((review) => (
            <div
              key={review.id}
              className="flex w-full gap-4 border-b py-4 items-start"
            >
              <Image
                src={getAvatar(review.user.id, review.user.avatar)}
                alt={review.user.name || ""}
                className="rounded-full"
                width={40}
                height={40}
              />
              <div className="w-full">
                <Link
                  href={`/user/profile/${review.user.id}`}
                  className="group"
                >
                  <p className="font-bold">
                    <span className="group-hover:underline">
                      {review.user.name}{" "}
                    </span>
                    <span className="text-xs bg-gray-200 px-1 py-0.5 ml-2">
                      {review.buyer ? "購入者" : "出品者"}
                    </span>
                  </p>
                </Link>
                <div className="bg-gray-100 p-2 w-full block rounded-md mt-1">
                  <p>{review.text}</p>
                  <p className="text-xs opacity-60">
                    {format(review.createdAt, "yyyy/MM/dd HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : page === 1 && bad.length > 0 ? (
          bad.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 border-b py-4 items-start"
            >
              <Image
                src={getAvatar(review.user.id, review.user.avatar)}
                alt={review.user.name || ""}
                className="rounded-full"
                width={40}
                height={40}
              />
              <div>
                <p className="font-bold">{review.user.name}</p>
                <p className="bg-gray-100 p-2 w-full block rounded-md mt-1">
                  {review.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>該当するレビューはありません</p>
        )}
      </div>
    </div>
  );
}
