import { useState } from "react";
import { PiSmiley, PiSmileySad } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

export default function Rating({
  reviewer,
  onSubmit,
}: {
  reviewer: "user" | "seller";
  onSubmit: (rating: number, text: string) => void;
}) {
  const [rating, setRating] = useState(1);
  const [ratingComment, setRatingComment] = useState("");
  return (
    <div className="mb-4">
      <h4 className="text-lg font-bold mb-2">
        {reviewer === "user" ? "出品者を評価する" : "購入者を評価する"}
      </h4>
      <hr />
      <div className="grid grid-cols-2 gap-4 m-4">
        <label
          htmlFor="good"
          className={twMerge(
            "flex flex-col items-center gap-2 text-red-500 py-4 rounded-md",
            rating === 1 && "bg-pink-100"
          )}
        >
          <PiSmiley size={48} />
          <p>良かった</p>
          <input
            type="radio"
            name="rating"
            id="good"
            value="1"
            onChange={() => setRating(1)}
            className="text-sky-500 focus:ring-sky-500"
          />
        </label>
        <label
          htmlFor="bad"
          className={twMerge(
            "flex flex-col items-center gap-2 text-blue-500 py-4 rounded-md",
            rating === 0 && "bg-blue-100"
          )}
        >
          <PiSmileySad size={48} />
          <p>悪かった</p>
          <input
            type="radio"
            name="rating"
            id="bad"
            value="0"
            onChange={() => setRating(0)}
            className="text-sky-500 focus:ring-sky-500"
          />
        </label>
      </div>
      <textarea
        rows={3}
        className="w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
        placeholder="評価コメント"
        onChange={(e) => setRatingComment(e.target.value)}
      ></textarea>
      <button
        onClick={() => {
          onSubmit(rating, ratingComment);
          setRating(1);
          setRatingComment("");
        }}
        disabled={ratingComment.length === 0}
        className="w-full bg-sky-500 text-white rounded-md px-4 py-2 duration-150 hover:bg-sky-600 disabled:bg-gray-400"
      >
        評価する
      </button>
    </div>
  );
}
