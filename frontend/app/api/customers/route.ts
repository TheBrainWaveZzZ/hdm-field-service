import { NextRequest, NextResponse } from "next/server";


const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:8000";


export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/customers?q=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          detail: `Backend returned ${response.status}`,
        },
        {
          status: response.status,
        }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Customer API proxy error:", error);

    return NextResponse.json(
      {
        detail: "Unable to reach FieldService backend.",
      },
      {
        status: 500,
      }
    );
  }
}