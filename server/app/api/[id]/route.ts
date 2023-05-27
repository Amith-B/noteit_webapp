import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, { params }: { params: string }) {
  console.log(req.url, params);
  return NextResponse.json({ name: "John Doe" });
}
