import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

type StatsRow = {
  average_rating: number | null;
  total: number;
};

type RestaurantRow = {
  name: string;
  cuisine: string;
  area: string;
};

function shapeReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const restaurantRows = (await sql.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId]
  )) as RestaurantRow[];
  const restaurant = restaurantRows[0];

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const statsRows = (await sql.query(
    "SELECT AVG(rating)::float8 AS average_rating, COUNT(*)::int AS total FROM reviews WHERE restaurant_id = $1",
    [restaurantId]
  )) as StatsRow[];
  const stats = statsRows[0];

  const reviewRows = (await sql.query(
    "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC",
    [restaurantId]
  )) as ReviewRow[];

  const [latestRow, ...olderRows] = reviewRows;

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating:
      stats.average_rating == null
        ? null
        : Math.round(stats.average_rating * 10) / 10,
    totalReviews: stats.total,
    latestReview: latestRow ? shapeReview(latestRow) : null,
    reviews: olderRows.map(shapeReview),
  });
}
