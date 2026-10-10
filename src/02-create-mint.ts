// Шаг 2: создаёт Mint на Token-2022 с расширением Metadata (name, symbol, uri).
import { Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
} from "@solana/spl-token";
import { TokenMetadata, createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { DECIMALS, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI } from "./config";
import { addrLink, connection, loadKeypair, txLink, writeState } from "./common";

async function main() {
  const payer = loadKeypair("wallet1.json");
  const mintKp = Keypair.generate();
  const mint = mintKp.publicKey;

  const metadata: TokenMetadata = {
    mint,
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: TOKEN_URI,
    additionalMetadata: [],
  };

  // Размер: сам mint + указатель на метаданные; затем данные метаданных
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID, // Token-2022, не классическая Token Program!
    }),
    // метаданные хранятся в самом mint-аккаунте
    createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint, DECIMALS, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint,
      metadata: mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [payer, mintKp]);
  writeState({ mint: mint.toBase58() });

  console.log("Mint создан:", mint.toBase58());
  console.log("Explorer mint:", addrLink(mint));
  console.log("Транзакция:   ", txLink(sig));
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
