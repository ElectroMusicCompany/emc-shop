import Link from "next/link";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";

export default function Pagination({
  count,
  page,
  path,
}: {
  count: number;
  page: number;
  path: string;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        {page !== 1 && (
          <Link
            href={`/${path}?page=${page - 1}`}
            className="flex items-center pl-3 pr-4 py-2 border-2 border-sky-500 text-sky-500 rounded-md duration-150 hover:bg-sky-100"
          >
            <MdOutlineKeyboardArrowLeft size={20} />
            <span>前へ</span>
          </Link>
        )}
      </div>
      <div>
        {page !== count && (
          <Link
            href={`/${path}?page=${page + 1}`}
            className="flex items-center pr-3 pl-4 py-2 border-2 border-sky-500 text-sky-500 rounded-md duration-150 hover:bg-sky-100"
          >
            <span>次へ</span>
            <MdOutlineKeyboardArrowRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
