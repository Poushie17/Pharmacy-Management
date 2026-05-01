import { prescriptionsData } from "@/data/prescriptions";

let prescriptions = prescriptionsData;

export async function GET() {
  return Response.json(prescriptions);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newPrescription = {
    id: Date.now().toString(),
    ...body,
  };

  prescriptions.push(newPrescription);

  return Response.json(newPrescription);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  prescriptions = prescriptions.filter((p) => p.id !== id);

  return Response.json({ success: true });
}