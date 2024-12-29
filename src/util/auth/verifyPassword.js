// utils/auth.ts
import * as bcrypt from "bcrypt";

export async function hashPassword(password) {
  console.log("Hashing password:", password);
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  console.log("Verifying with:");
  console.log("Password:", password);
  console.log("Stored hash:", hashedPassword);
  console.log("Hash length:", hashedPassword.length);
  return await bcrypt.compare(password, hashedPassword);
}
