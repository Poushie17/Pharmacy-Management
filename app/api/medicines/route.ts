import { medicines } from "@/data/medicines";

export async function GET() {
  return Response.json(medicines);
}