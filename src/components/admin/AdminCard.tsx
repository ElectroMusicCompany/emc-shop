import Link from "next/link";

export default function AdminCard({
  title,
  children,
  href,
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 aspect-video h-44">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
      {href && (
        <Link href={href} className="text-sky-500 hover:underline">
          詳細を見る
        </Link>
      )}
    </div>
  );
}
