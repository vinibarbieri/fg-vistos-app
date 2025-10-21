/**
 * Validações de Segurança para InfinitePay
 * 
 * IMPORTANTE: Estas validações garantem que apenas o handle "fgvistos" seja usado.
 * Qualquer tentativa de manipulação será bloqueada e logada.
 */

/**
 * Valida se o handle é exatamente "fgvistos"
 * @param handle Handle a ser validado
 * @returns true se for exatamente "fgvistos"
 */
export function isValidSecureHandle(handle: string): boolean {
  return handle === "fgvistos";
}

/**
 * Obtém o handle seguro fixo
 * @returns Sempre retorna "fgvistos"
 */
export function getSecureHandle(): string {
  return "fgvistos";
}

/**
 * Valida e bloqueia tentativas de manipulação do handle
 * @param body Corpo da requisição
 * @param request Objeto Request para logs
 * @returns true se válido, false se bloqueado
 */
export function validateHandleSecurity(body: { handle?: string }, request: Request): boolean {
  // Se alguém tentar enviar um handle diferente, BLOQUEAR
  if (body.handle && body.handle !== "fgvistos") {
    console.error("🚨 TENTATIVA DE MANIPULAÇÃO CRÍTICA:", {
      attemptedHandle: body.handle,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      origin: request.headers.get('origin') || 'unknown'
    });
    return false;
  }
  return true;
}

/**
 * Valida origem da requisição
 * @param request Objeto Request
 * @returns true se origem for válida
 */
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://fgvistos.com.br',
    'https://www.fgvistos.com.br',
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    console.error("❌ Tentativa de acesso não autorizada:", { origin, referer });
    return false;
  }
  
  return true;
}
