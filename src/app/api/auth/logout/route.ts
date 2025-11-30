import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LogoutPayload } from "@/types/auth";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body: LogoutPayload = {
      refreshToken: cookieStore.get("refreshToken")?.value || "",
    };
    const authHeader = request.headers.get("Authorization");

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/v1/auth/logout`,
      body,
      {
        headers: {
          Authorization: authHeader || "",
        },
      }
    );

    const { message } = response.data;

    cookieStore.delete("refreshToken");

    return NextResponse.json({ message }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof axios.AxiosError && error.response
        ? error.response.data?.error
        : "Login failed";

    return NextResponse.json(
      { error: message },
      {
        status:
          error instanceof axios.AxiosError && error.response
            ? error.response.status
            : 500,
      }
    );
  }
}
