"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function WriteReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const router = useRouter();
  const restaurantId = Number(params.restaurantId);

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      setRestaurantName(null);
      return;
    }
    fetch(`/api/restaurants/${params.restaurantId}`)
      .then((response) => response.json())
      .then((data) => setRestaurantName(data.name ?? "Restaurant"))
      .catch(() => setRestaurantName("Restaurant"));
  }, [params.restaurantId, restaurantId]);

  const canSubmit =
    rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, rating, comment }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/restaurant/${restaurantId}`);
  }

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <p className="text-stone-500">Restaurant not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <p className="text-sm text-stone-500">Write a review</p>
      <h1 className="mt-1 text-2xl font-medium tracking-tight">
        {restaurantName ?? "…"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-10">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Your rating
          </label>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                className={`text-3xl leading-none transition-colors ${
                  star <= rating
                    ? "text-[#C2410C]"
                    : "text-stone-300 hover:text-stone-400"
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-stone-500">
              {rating > 0 ? `${rating} of 5` : ""}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-stone-700"
          >
            Your review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            placeholder="What did you think?"
            className="mt-3 w-full resize-none rounded-lg border border-stone-200 bg-white px-4 py-3 text-base outline-none focus:border-[#C2410C]"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-[#C2410C] py-3 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
