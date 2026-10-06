import cron from "node-cron";
import { exec } from "child_process";

console.log("Starting PrintLab Automation Scheduler...");

// Run every 24 hours at 2:00 AM
cron.schedule("0 2 * * *", () => {
  console.log("Running daily synchronization...");
  
  exec("npx tsx scripts/sync-foomatic.ts", (error, stdout, stderr) => {
    if (error) console.error(`Error syncing Foomatic: ${error.message}`);
    console.log(stdout);
  });
  
  exec("npx tsx scripts/sync-github.ts", (error, stdout, stderr) => {
    if (error) console.error(`Error syncing GitHub: ${error.message}`);
    console.log(stdout);
  });
  
  exec("npx tsx scripts/detect-regressions.ts", (error, stdout, stderr) => {
    if (error) console.error(`Error detecting regressions: ${error.message}`);
    console.log(stdout);
  });
});

console.log("Scheduler is active.");
