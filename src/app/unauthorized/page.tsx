"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { PROJECT_NAME } from "@/lib/constants";
import { useI18n } from "@/contexts/I18nContext";

export default function UnauthorizedPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("unauthorized.title")}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t("unauthorized.description")}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              {t("unauthorized.pleaseSignIn")} {PROJECT_NAME} {t("unauthorized.accountToContinue")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t("auth.signIn")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
