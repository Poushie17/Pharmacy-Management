import { restockOrders, lowStockData } from "@/data/restock";

export async function GET() {
  return Response.json({
    orders: restockOrders,
    lowStock: lowStockData,
  });
}