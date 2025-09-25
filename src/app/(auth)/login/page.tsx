"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/users/auth";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearErrors();

    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back !</h1>
            <p className="text-gray-600">
              Enter to get unlimited access to data & information.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your mail address"
                {...register("email")}
                className={`h-12 px-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                  className={`h-12 px-4 pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Forgot your password ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or login with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Login with google</span>
            </Button>
          </form>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400 rounded-full opacity-20"></div>
          <div className="absolute bottom-32 left-16 w-48 h-48 bg-blue-400 rounded-full opacity-30"></div>

          <div className="absolute top-32 left-32 w-16 h-16 bg-yellow-400 transform rotate-45"></div>
          <div className="absolute top-64 right-48 w-12 h-12 bg-cyan-400 rounded-full"></div>
          <div className="absolute bottom-48 right-32 w-8 h-8 bg-pink-400 rounded-full"></div>

          <div className="absolute top-48 left-48 grid grid-cols-4 gap-2 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
            ))}
          </div>

          <div className="absolute bottom-64 left-64 w-32 h-1 bg-cyan-400 opacity-60"></div>
          <div className="absolute top-80 right-64 w-1 h-24 bg-yellow-400 opacity-60"></div>

          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white opacity-20 rounded-full"></div>
          <div className="absolute top-40 left-20 w-20 h-20 border-2 border-cyan-400 opacity-40 rounded-full"></div>

          <div className="absolute top-72 left-72">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-blue-300 opacity-60"></div>
          </div>

          <div className="absolute bottom-80 left-80 text-yellow-400 text-4xl opacity-80">
            ★
          </div>

          <div className="absolute top-96 right-96 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-70"></div>
          <div className="absolute bottom-96 left-96 w-4 h-16 bg-gradient-to-b from-cyan-400 to-blue-400 opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
