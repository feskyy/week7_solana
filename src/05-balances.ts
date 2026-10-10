// Шаг 5: читает метаданные mint и балансы обоих кошельков.
import { TOKEN_2022_PROGRAM_ID, getAccount, getAssociatedTokenAddressSync, getMint, getTokenMetadata } from "@solana/spl-token";
import { addrLink, connection, loadKeypair, requireMint } from "./common";

async function main() {
  const mint = requireMint();
  const info = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
  const meta = await getTokenMetadata(connection, mint);

  console.log("Mint:", mint.toBase58(), "|", addrLink(mint));
  console.log("decimals:", info.decimals, "| supply (мин. единиц):", info.supply.toString());
  console.log("mint authority:", info.mintAuthority?.toBase58() ?? "нет");
  console.log("Метаданные:", meta ? { name: meta.name, symbol: meta.symbol, uri: meta.uri } : "не найдены");

  for (const name of ["wallet1.json", "wallet2.json"]) {
    const w = loadKeypair(name);
    const ata = getAssociatedTokenAddressSync(mint, w.publicKey, false, TOKEN_2022_PROGRAM_ID);
    try {
      const acc = await getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
      const human = Number(acc.amount) / 10 ** info.decimals;
      console.log(`\n${name}  ${w.publicKey.toBase58()}`);
      console.log(`  ATA ${ata.toBase58()}`);
      console.log(`  баланс: ${human} (мин. единиц: ${acc.amount})`);
    } catch {
      console.log(`\n${name}  ${w.publicKey.toBase58()}\n  ATA ещё не создан`);
    }
  }
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
