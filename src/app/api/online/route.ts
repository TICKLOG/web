import { countOnline } from "@/lib/online";

// Players online right now, polled by the home page.
export async function GET() {
  return Response.json({ online: await countOnline() });
}
