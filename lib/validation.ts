import { z, ZodError } from "zod";
import { NextResponse } from "next/server";

// Certifique-se de que o schema também está sendo exportado
export const paymentSchema = z.object({
  amount: z.number().min(30000, "Valor mínimo é R$ 300,00"),
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  order_nsu: z.string().min(1, "ID do pedido é obrigatório"),
  // Adicione outros campos necessários como redirect_url se precisar
  redirect_url: z.string().url("URL de redirecionamento inválida"),
});

// AQUI ESTÁ O PONTO CRÍTICO: a palavra 'export' é essencial
export async function validateRequestBody(
  request: Request,
  schema: z.ZodSchema
) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      const response = NextResponse.json(
        { error: "Dados inválidos", details: errors },
        { status: 400 }
      );
      return { data: null, error: response };
    }
    const response = NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
    return { data: null, error: response };
  }
}
