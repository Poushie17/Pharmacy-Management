import { weeklySales } from "@/data/weeklySales";

export async function GET() {
  return Response.json(weeklySales);
}