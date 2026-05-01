import { reportData } from "@/data/reports";

export async function GET() {
  return Response.json(reportData);
}