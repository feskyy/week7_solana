// ===== НАСТРОЙКИ ТОКЕНА
export const TOKEN_NAME = "Loyalty Point";
export const TOKEN_SYMBOL = "LPT";
// Публичная ссылка на token.json (GitHub raw):
export const TOKEN_URI =
  "https://raw.githubusercontent.com/feskyy/week7_solana/refs/heads/main/token.json";
// decimals: при 6 знаках 1 токен = 1 000 000 минимальных единиц
export const DECIMALS = 6;
// Сколько целых токенов выпустить и сколько отправить второму кошельку
export const MINT_AMOUNT_TOKENS = 1000n;
export const TRANSFER_AMOUNT_TOKENS = 100n;
// Для бонуса (расширение TransferFee): комиссия 1% (100 базисных пунктов), максимум 5 токенов
export const FEE_BASIS_POINTS = 100;
export const MAX_FEE_TOKENS = 5n;
