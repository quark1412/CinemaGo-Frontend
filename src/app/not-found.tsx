"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import { PROJECT_NAME } from "@/lib/constants";
import { useI18n } from "@/contexts/I18nContext";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("notFound.title")}
            </CardTitle>
            <p className="text-gray-600 mt-2">{t("notFound.description")}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <p className="text-sm text-gray-500">
              {t("notFound.sorry")} {PROJECT_NAME}
            </p>
          </div>

          <Button className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              {t("notFound.goHome")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
