import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg">Zomato Lite is alive.</p>
        <Link
          href="/restaurant/1"
          className="mt-4 inline-block text-sm font-medium text-[#C2410C]"
        >
          Ludhiana Burrito →
        </Link>
      </div>
    </main>
  );
}
