"use client";

import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";

const languages = [
  { value: "en" as const, label: "English" },
  { value: "vi" as const, label: "Tiếng Việt" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[150px]">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
