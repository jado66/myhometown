// updatePassword.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

async function hashPassword(password) {
  console.log("Hashing password:", password);
  return await bcrypt.hash(password, 12);
}

async function updateEnv() {
  // Use an environment variable set manually or provide a default value
  const newPassword = process.argv[2] || "defaultPassword";
  const hashedPassword = await hashPassword(newPassword);

  console.log(`New Password: ${newPassword}`);
  console.log(`Hashed Password: ${hashedPassword.replace(/$/g, "#")}`);

  const envPath = path.resolve(__dirname, ".env.local");
  let envContents = fs.readFileSync(envPath, "utf8");

  // Update the .env.local file contents by replacing existing entries
  envContents = envContents.replace(
    /ADMIN_PASSWORD=[^\n]*/,
    `ADMIN_PASSWORD=${newPassword}`
  );

  const newEnvContents = envContents
    .replace(/ADMIN_PASSWORD=.*(?=\n|$)/, `ADMIN_PASSWORD=${newPassword}`)
    .replace(
      /ADMIN_PASSWORD_HASH=.*(?=\n|$)/,
      `ADMIN_PASSWORD_HASH=${hashedPassword}`
    );

  fs.writeFileSync(envPath, envContents);
  console.log(".env.local updated successfully!");
}

updateEnv().catch((err) => console.error("Error updating .env.local:", err));
