import { sales } from "@/data/sales";

export async function GET() {
  return Response.json(sales);
}