import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LoginPayload } from "@/types/auth";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body: LoginPayload = await request.json();

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/v1/auth/login`,
      body
    );

    const { accessToken, refreshToken } = response.data;

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json(
      { accessToken: accessToken, refreshToken: refreshToken },
      { status: 200 }
    );
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
