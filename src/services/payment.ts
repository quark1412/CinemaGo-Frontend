import instance from "@/configs/axiosConfig";

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  URL: string;
  bookingId?: string;
}

export const paymentService = {
  checkoutWithMoMo: async (
    amount: number,
    bookingId: string,
    urlCheckoutCompleted?: string
  ): Promise<PaymentResponse> => {
    try {
      const response = await instance.post(
        "/v1/payments/momo/checkout",
        {
          amount,
          bookingId,
          urlCheckoutCompleted,
        },
        {
          requiresAuth: true,
        } as any
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to checkout with MoMo"
      );
    }
  },

  checkMoMoStatus: async (bookingId: string): Promise<{ message: string }> => {
    try {
      const response = await instance.get(
        `/v1/payments/public/momo/status/${bookingId}`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  checkoutWithVnPay: async (
    amount: number,
    bookingId: string,
    urlCheckoutCompleted?: string
  ): Promise<PaymentResponse> => {
    try {
      const response = await instance.post(
        "/v1/payments/vnpay/checkout",
        {
          amount,
          bookingId,
          urlCheckoutCompleted,
        },
        {
          requiresAuth: true,
        } as any
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to checkout with VnPay"
      );
    }
  },

  checkoutWithZaloPay: async (
    amount: number,
    bookingId: string,
    urlCheckoutCompleted?: string
  ): Promise<PaymentResponse> => {
    try {
      const response = await instance.post(
        "/v1/payments/zalopay/checkout",
        {
          amount,
          bookingId,
          urlCheckoutCompleted,
        },
        {
          requiresAuth: true,
        } as any
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to checkout with ZaloPay"
      );
    }
  },

  checkZaloPayStatus: async (bookingId: string): Promise<Payment> => {
    try {
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const bookingIdWithoutDashes = bookingId.replace(/-/g, "");
      const app_trans_id = `${dateStr}_${bookingIdWithoutDashes}`;

      const response = await instance.get(
        `/v1/payments/public/zalopay/status/${app_trans_id}`
      );

      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  },
};
