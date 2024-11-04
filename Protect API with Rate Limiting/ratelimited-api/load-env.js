import "dotenv/config";

import { exec } from "node:child_process";

// Run Wrangler Dev command after loading .env variables
exec("wrangler dev src/index.ts", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
