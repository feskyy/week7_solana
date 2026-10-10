import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const KEYS_DIR = path.join(__dirname, "..", "keys");
const STATE_FILE = path.join(__dirname, "..", "state.json");

export function saveKeypair(name: string, kp: Keypair) {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
  fs.writeFileSync(path.join(KEYS_DIR, name), JSON.stringify(Array.from(kp.secretKey)));
}

export function loadKeypair(name: string): Keypair {
  const file = path.join(KEYS_DIR, name);
  if (!fs.existsSync(file)) {
    throw new Error(`Нет файла ${file}. Сначала выполните: npm run wallets`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, "utf8"))));
}

type State = { mint?: string; mintWithFee?: string };

export function readState(): State {
  return fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : {};
}

export function writeState(patch: State) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...patch }, null, 2));
}

export function requireMint(key: "mint" | "mintWithFee" = "mint"): PublicKey {
  const v = readState()[key];
  if (!v) throw new Error("Mint ещё не создан. Выполните шаг создания mint.");
  return new PublicKey(v);
}

export const txLink = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
export const addrLink = (a: PublicKey | string) =>
  `https://explorer.solana.com/address/${a.toString()}?cluster=devnet`;
