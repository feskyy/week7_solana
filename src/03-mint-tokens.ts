// Шаг 3: создаёт ATA для wallet1 и выпускает токены (mint_to).
import { TOKEN_2022_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { DECIMALS, MINT_AMOUNT_TOKENS } from "./config";
import { addrLink, connection, loadKeypair, requireMint, txLink } from "./common";

async function main() {
  const payer = loadKeypair("wallet1.json"); // он же mint authority
  const mint = requireMint();

  const ata = await getOrCreateAssociatedTokenAccount(
    connection, payer, mint, payer.publicKey,
    false, undefined, undefined, TOKEN_2022_PROGRAM_ID
  );
  console.log("ATA wallet1:", ata.address.toBase58());

  const amount = MINT_AMOUNT_TOKENS * 10n ** BigInt(DECIMALS); // в минимальных единицах
  const sig = await mintTo(
    connection, payer, mint, ata.address, payer, amount,
    [], undefined, TOKEN_2022_PROGRAM_ID
  );
  console.log(`Выпущено ${MINT_AMOUNT_TOKENS} токенов (${amount} мин. единиц)`);
  console.log("Транзакция выпуска:", txLink(sig));
  console.log("Explorer ATA:", addrLink(ata.address));
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
