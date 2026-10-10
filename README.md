# Неделя 7. Токен на Token-2022 с метаданными

Курс «ИТ-стартап. Итоговый проект 1», РО2. Лабораторная работа 7.

Токен-баллы лояльности: Mint на Token Extensions (Token-2022) с расширением Metadata (name, symbol, URI),
выпуск токенов, перевод между двумя кошельками, чтение балансов — всё через TypeScript-клиент
(`@solana/web3.js`, `@solana/spl-token`) в сети Devnet.

## Порядок запуска
```bash
npm install
npm run wallets        # 1. два кошелька (keys/, в git не попадают), пополнить wallet1 SOL
npm run mint-create    # 2. mint Token-2022 + метаданные
npm run mint-tokens    # 3. ATA для wallet1 + mint_to
npm run transfer       # 4. ATA для wallet2 + transfer
npm run balances       # 5. метаданные и балансы
# бонус (расширение TransferFee):
npm run bonus-mint && npm run bonus-transfer
```
Настройки токена — в `src/config.ts`; описание токена — `token.json` (публичная ссылка указана как URI).

## Ключевые понятия
- **Mint** — описание токена (decimals, mint authority, метаданные); **Token Account (ATA)** — баланс конкретного держателя.
- Программа **Token-2022** (`TOKEN_2022_PROGRAM_ID`) вместо классической Token Program — даёт расширения (метаданные в mint, комиссия за перевод и др.).
- `decimals = 6`: 1 токен = 1 000 000 минимальных единиц.
- У получателя перед переводом должен быть ATA.

## Результаты сдачи (заполнить)
- Адрес mint: `<...>` — https://explorer.solana.com/address/<MINT>?cluster=devnet
- Транзакция выпуска: `<...>`
- Транзакция перевода: `<...>`
- Скриншот токена с метаданными в Explorer: `screenshots/token.png`
- Бонус (TransferFee): `<адрес mint и объяснение, зачем это продукту>`
