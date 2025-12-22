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
    bookingId: string
  ): Promise<PaymentResponse> => {
    try {
      const response = await instance.post(
        "/v1/payments/momo/checkout",
        {
          amount,
          bookingId,
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
};
