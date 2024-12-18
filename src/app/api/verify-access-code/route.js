import { NextResponse } from "next/server";

export async function POST(request) {
  const { accessCode } = await request.json();
  const correctCode = process.env.CLASS_ACCESS_CODE;

  if (accessCode === correctCode) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
