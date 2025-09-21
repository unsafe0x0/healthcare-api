import * as crypto from "crypto";

export function aptIdHash(input: string): string {
  const hash = crypto.createHash("md5").update(input).digest("hex");
  const num = parseInt(hash, 16) % 100000000;
  return "APT" + num.toString().padStart(9, "0");
}
