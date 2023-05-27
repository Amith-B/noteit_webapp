// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, { params }: { params: string }) {
  console.log(req.url, params);
  return NextResponse.json({ name: "John Doe" });
}


export async function POST(req: NextApiRequest, { params }: { params: string }) {
  console.log(req.url, params);
  return NextResponse.json({ name: "John Doe" });
}
