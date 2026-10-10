// БОНУС: выпуск и перевод токена с комиссией (mint из bonus-02).
import {
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transferCheckedWithFee,
} from "@solana/spl-token";
import { DECIMALS, FEE_BASIS_POINTS, MAX_FEE_TOKENS, MINT_AMOUNT_TOKENS, TRANSFER_AMOUNT_TOKENS } from "./config";
import { connection, loadKeypair, requireMint, txLink } from "./common";

async function main() {
  const owner = loadKeypair("wallet1.json");
  const receiver = loadKeypair("wallet2.json");
  const mint = requireMint("mintWithFee");
  const unit = 10n ** BigInt(DECIMALS);

  const src = await getOrCreateAssociatedTokenAccount(
    connection, owner, mint, owner.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID
  );
  const dst = await getOrCreateAssociatedTokenAccount(
    connection, owner, mint, receiver.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID
  );

  await mintTo(connection, owner, mint, src.address, owner, MINT_AMOUNT_TOKENS * unit,
    [], undefined, TOKEN_2022_PROGRAM_ID);

  const amount = TRANSFER_AMOUNT_TOKENS * unit;
  // комиссия = amount * bps / 10000 (с округлением вверх), но не больше максимума
  let fee = (amount * BigInt(FEE_BASIS_POINTS) + 9999n) / 10000n;
  const maxFee = MAX_FEE_TOKENS * unit;
  if (fee > maxFee) fee = maxFee;

  const sig = await transferCheckedWithFee(
    connection, owner, src.address, mint, dst.address, owner, amount, DECIMALS, fee,
    [], undefined, TOKEN_2022_PROGRAM_ID
  );
  const received = await getAccount(connection, dst.address, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`Отправлено ${amount} мин. ед., комиссия ${fee}, получатель получил ${received.amount}`);
  console.log("Транзакция:", txLink(sig));
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
