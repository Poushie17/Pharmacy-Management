import { stockData } from "@/data/stock";

export async function GET() {
  return Response.json(stockData);
}