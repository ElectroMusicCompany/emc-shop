import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import { countRating } from "@/utils/countRating";
import { Review } from "@prisma/client";

export default function Reviews({ reviews }: { reviews: Review[] }) {
  const rating = countRating(reviews);
  return (
    <div className="flex items-center">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            {rating - i >= 1 ? (
              <IoStar className="text-yellow-400" />
            ) : rating - i >= 0.5 ? (
              <IoStarHalf className="text-yellow-400" />
            ) : (
              <IoStarOutline className="text-yellow-400" />
            )}
          </div>
        ))}
      </div>
      <span className="text-sky-500 text-sm ml-1">{reviews.length}</span>
    </div>
  );
}
