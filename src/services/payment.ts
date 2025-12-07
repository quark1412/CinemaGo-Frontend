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
  paymentId?: string;
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

  checkMoMoStatus: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await instance.get(
        `/v1/payments/public/momo/status/${paymentId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await instance.get(`/v1/payments/${paymentId}`, {
        requiresAuth: true,
      } as any);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payment"
      );
    }
  },
};
