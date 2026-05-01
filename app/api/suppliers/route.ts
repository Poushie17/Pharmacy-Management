import { suppliersData } from "@/data/suppliers";

export async function GET() {
  return Response.json(suppliersData);
}