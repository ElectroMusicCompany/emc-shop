import { Review } from "@prisma/client";

export const countRating = (reviews: {id: string, rating: boolean}[]) => {
  if (reviews.length === 0) return 0;
  // 評価は1か0のみ
  // 1の数をカウントして全体を5としたときの割合を求める
  const count = reviews.filter((review) => review.rating).length;
  return Math.round(((count / reviews.length) * 5) * 10) / 10;
}
