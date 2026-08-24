"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<RestaurantData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading"
  );

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("not found");
        }
        return response.json();
      })
      .then((payload: RestaurantData) => {
        setData(payload);
        setStatus("ready");
      })
      .catch(() => setStatus("missing"));
  }, [params.id]);

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  if (status === "missing" || !data) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <h1 className="text-xl font-medium">Restaurant not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          Check the link and try again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">{data.name}</h1>
        <p className="mt-2 text-sm text-stone-500">
          {data.cuisine} · {data.area}
        </p>
      </header>

      {data.totalReviews === 0 ? (
        <section className="mt-12 rounded-lg border border-dashed border-stone-300 px-6 py-10 text-center">
          <p className="text-base font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-stone-500">
            Be the first to review {data.name}.
          </p>
          <Link
            href={`/review/${params.id}`}
            className="mt-6 inline-block rounded-lg bg-[#C2410C] px-5 py-2.5 text-sm font-medium text-white"
          >
            Write the first review
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-10 flex items-baseline gap-3">
            <span className="text-6xl font-medium tracking-tight">
              {data.averageRating}
            </span>
            <span className="text-sm text-stone-500">
              {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
            </span>
          </section>

          {data.latestReview && (
            <section className="mt-8 rounded-lg border border-stone-200 border-l-4 border-l-[#C2410C] bg-white px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#C2410C]">
                Latest
              </p>
              <p className="mt-2 text-base">{data.latestReview.comment}</p>
              <p className="mt-2 text-xs text-stone-500">
                {"★".repeat(data.latestReview.rating)}
                {"☆".repeat(5 - data.latestReview.rating)} ·{" "}
                {formatDate(data.latestReview.createdAt)}
              </p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-sm font-medium text-stone-700">
              Earlier reviews
            </h2>
            <ul className="mt-4 divide-y divide-stone-200">
              {data.reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <p className="text-base">{review.comment}</p>
                  <p className="mt-1.5 text-xs text-stone-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)} ·{" "}
                    {formatDate(review.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <footer className="mt-12 border-t border-stone-200 pt-6">
        <Link
          href={`/review/${params.id}`}
          className="text-sm font-medium text-[#C2410C]"
        >
          Write a review →
        </Link>
      </footer>
    </main>
  );
}
