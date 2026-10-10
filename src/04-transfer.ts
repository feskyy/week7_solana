// Шаг 4: создаёт ATA для wallet2 (платит wallet1) и переводит токены.
import { TOKEN_2022_PROGRAM_ID, getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";
import { DECIMALS, TRANSFER_AMOUNT_TOKENS } from "./config";
import { connection, loadKeypair, requireMint, txLink } from "./common";

async function main() {
  const owner = loadKeypair("wallet1.json");
  const receiver = loadKeypair("wallet2.json");
  const mint = requireMint();

  const src = await getOrCreateAssociatedTokenAccount(
    connection, owner, mint, owner.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID
  );
  // У получателя должен быть ATA — иначе перевод падает. Создаём его (платит owner).
  const dst = await getOrCreateAssociatedTokenAccount(
    connection, owner, mint, receiver.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID
  );

  const amount = TRANSFER_AMOUNT_TOKENS * 10n ** BigInt(DECIMALS);
  const sig = await transferChecked(
    connection, owner, src.address, mint, dst.address, owner, amount, DECIMALS,
    [], undefined, TOKEN_2022_PROGRAM_ID
  );
  console.log(`Переведено ${TRANSFER_AMOUNT_TOKENS} токенов на ${receiver.publicKey.toBase58()}`);
  console.log("Транзакция перевода:", txLink(sig));
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
