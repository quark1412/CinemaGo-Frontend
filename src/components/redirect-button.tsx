import { cn } from "@/lib/utils";
import { useRouter } from "next/router";

export default function Redirect({
  href,
  title,
  className,
}: {
  href: string;
  title: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button className={cn(className)} onClick={() => router.push(href)}>
      {title}
    </button>
  );
}
