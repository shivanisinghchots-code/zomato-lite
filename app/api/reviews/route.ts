import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be a whole number between 1 and 5" },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "comment cannot be empty" },
      { status: 400 }
    );
  }

  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "restaurant does not exist" },
      { status: 400 }
    );
  }

  const existing = await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId]
  );
  if (existing.length === 0) {
    return NextResponse.json(
      { error: "restaurant does not exist" },
      { status: 400 }
    );
  }

  const inserted = await sql.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantId, rating, comment.trim()]
  );

  const reviewId = (inserted[0] as { id: number }).id;

  return NextResponse.json({ success: true, reviewId }, { status: 201 });
}
