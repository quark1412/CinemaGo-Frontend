"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { paymentService } from "@/services/payment";
import { formatPrice } from "@/lib/utils";

type Status = "pending" | "success" | "failed";

export default function BookingCompletedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string>(
    "Đang kiểm tra trạng thái thanh toán..."
  );
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const queryPaymentId = searchParams.get("paymentId");
    const storedPaymentId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("paymentId")
        : null;

    const usedPaymentId = queryPaymentId || storedPaymentId;

    if (!usedPaymentId) {
      setStatus("failed");
      setMessage("Không tìm thấy thông tin thanh toán.");
      return;
    }

    setPaymentId(usedPaymentId);

    if (typeof window !== "undefined") {
      const storedBookingId = window.localStorage.getItem("bookingId");
      if (storedBookingId) {
        setBookingId(storedBookingId);
      }
    }

    const checkStatus = async () => {
      try {
        const payment: any = await paymentService.checkMoMoStatus(
          usedPaymentId
        );

        console.log(payment);

        if (payment && payment.status === "Đã thanh toán") {
          setStatus("success");
          setMessage(
            "Thanh toán MoMo thành công. Đặt vé của bạn đã được xác nhận."
          );
          setAmount(payment.amount ?? null);
          if (payment.bookingId) {
            setBookingId(payment.bookingId);
          }

          if (typeof window !== "undefined") {
            window.localStorage.removeItem("paymentId");
            window.localStorage.removeItem("bookingId");
          }
        } else {
          setStatus("failed");
          setMessage("Thanh toán không thành công hoặc đã bị hủy.");
        }
      } catch (error: any) {
        setStatus("failed");
        setMessage(
          error?.message || "Không thể kiểm tra trạng thái thanh toán."
        );
      }
    };

    checkStatus();
  }, [searchParams]);

  const handleBackToPOS = () => {
    router.push("/pos");
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border bg-background p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === "pending" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <h1 className="text-2xl font-bold">
                Đang xử lý thanh toán MoMo...
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h1 className="text-2xl font-bold">
                Thanh toán và đặt vé thành công!
              </h1>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <h1 className="text-2xl font-bold">
                Thanh toán không thành công
              </h1>
            </>
          )}

          <p className="text-muted-foreground">{message}</p>

          <div className="mt-4 w-full space-y-2 rounded-md bg-muted p-4 text-left text-sm">
            {paymentId && (
              <div className="flex justify-between">
                <span className="font-medium">Mã thanh toán:</span>
                <span className="font-mono text-xs">{paymentId}</span>
              </div>
            )}
            {bookingId && (
              <div className="flex justify-between">
                <span className="font-medium">Mã đặt vé:</span>
                <span className="font-mono text-xs">{bookingId}</span>
              </div>
            )}
            {amount != null && (
              <div className="flex justify-between">
                <span className="font-medium">Số tiền:</span>
                <span>{formatPrice(amount)}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={handleBackToPOS}>
              Quay lại POS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
