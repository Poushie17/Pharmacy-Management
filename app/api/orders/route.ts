import { orders } from "@/data/orders";

export async function GET() {
  return Response.json(orders);
}