import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RefreshTokenPayload } from "@/types/auth";
import axios from "axios";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value || null;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token" },
        { status: 400 }
      );
    }

    const body: RefreshTokenPayload = { refreshToken };

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/v1/auth/refresh-token`,
      body
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json(
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      { status: 200 }
    );
  } catch (error: unknown) {
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");
    const message =
      error instanceof axios.AxiosError && error.response
        ? error.response.data
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
