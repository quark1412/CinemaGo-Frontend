import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - CinemaGo",
  description: "Sign in to your CinemaGo account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
