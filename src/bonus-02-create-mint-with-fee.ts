// БОНУС (повышенный балл): второй mint с расширением TransferFee —
// комиссия за перевод (по умолчанию 1%, не более 5 токенов).
// Зачем продукту: стартап получает долю с каждого перевода баллов между пользователями.
import { Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  getMintLen,
} from "@solana/spl-token";
import { TokenMetadata, createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { DECIMALS, FEE_BASIS_POINTS, MAX_FEE_TOKENS, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI } from "./config";
import { addrLink, connection, loadKeypair, txLink, writeState } from "./common";

async function main() {
  const payer = loadKeypair("wallet1.json");
  const mintKp = Keypair.generate();
  const mint = mintKp.publicKey;

  const metadata: TokenMetadata = {
    mint,
    name: TOKEN_NAME + " (fee)",
    symbol: TOKEN_SYMBOL + "F",
    uri: TOKEN_URI,
    additionalMetadata: [],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer, ExtensionType.TransferFeeConfig]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
  const maxFee = MAX_FEE_TOKENS * 10n ** BigInt(DECIMALS);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID),
    createInitializeTransferFeeConfigInstruction(
      mint, payer.publicKey, payer.publicKey, FEE_BASIS_POINTS, maxFee, TOKEN_2022_PROGRAM_ID
    ),
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
  writeState({ mintWithFee: mint.toBase58() });
  console.log("Mint с комиссией создан:", mint.toBase58());
  console.log("Explorer mint:", addrLink(mint));
  console.log("Транзакция:   ", txLink(sig));
}

main().catch((e) => { console.error("Ошибка:", e.message ?? e); process.exit(1); });
