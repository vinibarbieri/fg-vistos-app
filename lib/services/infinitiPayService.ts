/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

interface InfinitePayConfig {
  apiUrl: string;
  handle: string;
}

interface CreateCheckoutRequest {
  amount: number;
  description: string;
  order_nsu: string;
  redirect_url: string;
  webhook_url?: string;
}

interface CreateCheckoutResponse {
  url: string;
  success: boolean;
}

interface CheckPaymentRequest {
  order_nsu: string;
  transaction_nsu: string;
}

interface CheckPaymentResponse {
  success: boolean;
  paid: boolean;
  amount: number;
  paid_amount: number;
}

class InfinitePayService {
  private config: InfinitePayConfig;

  constructor() {
    this.config = {
      apiUrl:
        process.env.INFINITEPAY_API_URL || "https://api.infinitepay.com.br",
      handle: process.env.INFINITEPAY_HANDLE || "",
    };

    if (!this.config.handle) {
      console.warn("⚠️ INFINITEPAY_HANDLE não configurado");
    }
  }

  async createCheckout(
    data: CreateCheckoutRequest
  ): Promise<CreateCheckoutResponse> {
    try {
      if (!this.config.handle) {
        throw new Error("Handle do InfinitePay não configurado");
      }

      const response = await axios.post(
        `${this.config.apiUrl}/checkout`,
        {
          handle: this.config.handle,
          amount: data.amount,
          description: data.description,
          order_nsu: data.order_nsu,
          redirect_url: data.redirect_url,
          webhook_url: data.webhook_url,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "FG-Vistos-Backend/1.0",
          },
        }
      );

      return {
        url: response.data.url,
        success: true,
      };
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      throw new Error("Falha ao criar checkout no InfinitePay");
    }
  }

  async checkPayment(data: CheckPaymentRequest): Promise<CheckPaymentResponse> {
    try {
      if (!this.config.handle) {
        throw new Error("Handle do InfinitePay não configurado");
      }

      const response = await axios.post(`${this.config.apiUrl}/payment/check`, {
        handle: this.config.handle,
        order_nsu: data.order_nsu,
        transaction_nsu: data.transaction_nsu,
      });

      return {
        success: true,
        paid: response.data.paid || false,
        amount: response.data.amount || 0,
        paid_amount: response.data.paid_amount || 0,
      };
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
      throw new Error("Falha ao verificar pagamento no InfinitePay");
    }
  }

  // Webhook para receber notificações do InfinitePay
  async handleWebhook(payload: any): Promise<{ success: boolean }> {
    try {
      // Aqui você pode processar o webhook
      // Por exemplo, atualizar o status do pedido no banco
      console.log("Webhook recebido:", payload);

      return { success: true };
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      return { success: false };
    }
  }
}

export const infinitePayService = new InfinitePayService();
export default InfinitePayService;
