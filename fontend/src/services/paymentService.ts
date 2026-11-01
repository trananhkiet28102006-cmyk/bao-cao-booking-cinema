import { apiClient } from './api';

export interface ZaloPayOrderResponse {
  returnCode: number;
  returnMessage: string;
  orderUrl: string;
  zpTransToken: string;
  appTransId: string;
  qrCode?: string;
}

export const paymentService = {
  createZaloPayOrder: async (bookingId: number) => {
    const res = await apiClient.post(`/payments/zalopay/create/${bookingId}`);
    return res.data;
  },
  
  queryZaloPayStatus: async (appTransId: string) => {
    const res = await apiClient.get(`/payments/zalopay/status/${appTransId}`);
    return res.data;
  },
};
