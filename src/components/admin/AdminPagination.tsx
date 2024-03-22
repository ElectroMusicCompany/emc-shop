import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function AdminPagination({
  count,
  page,
  path,
}: {
  count: number;
  page: number;
  path: string;
}) {
  return (
    <div className="flex items-center justify-end mt-4">
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <Link
          key={i}
          href={`/adm/${path}?page=${i}`}
          className={twMerge(
            "px-4 py-1",
            i === 1 && "rounded-l-md",
            i === page ? "bg-sky-500 text-white" : "bg-white hover:bg-gray-100",
            i === count && "rounded-r-md"
          )}
        >
          {i}
        </Link>
      ))}
    </div>
  );
}
