import { customers } from "@/data/customers";

export async function GET() {
  return Response.json(customers);
}