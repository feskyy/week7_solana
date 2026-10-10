// Шаг 1: создаёт два кошелька. wallet1 — владелец и плательщик, wallet2 — получатель.
import * as fs from "fs";
import * as path from "path";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { addrLink, connection, loadKeypair, saveKeypair } from "./common";

async function main() {
  const keysDir = path.join(__dirname, "..", "keys");
  if (fs.existsSync(path.join(keysDir, "wallet1.json"))) {
    console.log("Кошельки уже созданы, использую существующие.");
  } else {
    saveKeypair("wallet1.json", Keypair.generate());
    saveKeypair("wallet2.json", Keypair.generate());
    console.log("Созданы keys/wallet1.json и keys/wallet2.json");
  }
  const w1 = loadKeypair("wallet1.json");
  const w2 = loadKeypair("wallet2.json");
  console.log("\nwallet1 (владелец, платит комиссии):", w1.publicKey.toBase58());
  console.log("wallet2 (получатель):               ", w2.publicKey.toBase58());
  console.log("Explorer wallet1:", addrLink(w1.publicKey));

  let balance = await connection.getBalance(w1.publicKey);
  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    try {
      console.log("\nПробую airdrop 1 SOL...");
      const sig = await connection.requestAirdrop(w1.publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      balance = await connection.getBalance(w1.publicKey);
    } catch {
      console.log("\nAirdrop не сработал (лимит). Это нормально — пополните вручную:");
      console.log("  1) откройте https://faucet.solana.com, выберите Devnet,");
      console.log("     вставьте адрес wallet1 (выше) и запросите 1–2 SOL;");
      console.log("  2) либо отправьте SOL из кошелька Playground на адрес wallet1.");
    }
  }
  console.log(`\nБаланс wallet1: ${balance / LAMPORTS_PER_SOL} SOL (нужно хотя бы 0.1)`);
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
