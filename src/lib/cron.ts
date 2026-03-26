/**
 * Auto-Complete Bookings Scheduler
 *
 * IMPORTANT: This file is OPTIONAL
 *
 * To enable automatic booking completion:
 * 1. Uncomment the import in src/app/layout.tsx
 * 2. Call initAutoCompleteScheduler() in your app initialization
 *
 * For production, consider using external cron services instead.
 */

export async function initAutoCompleteScheduler() {
  // This is a Next.js approach using an internal API call
  // If you want node-cron, install it first:
  // npm install node-cron @types/node-cron

  const runAutoComplete = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/auto-complete`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          "❌ Auto-complete failed:",
          response.status,
          await response.text(),
        );
        return;
      }

      const data = await response.json();
      console.log(
        "✅ Auto-complete ran successfully:",
        JSON.stringify(data.stats, null, 2),
      );
    } catch (error) {
      console.error("❌ Auto-complete error:", error);
    }
  };

  // Option 1: Using node-cron (requires npm install)
  try {
    const cron = await import("node-cron");

    // Run every 5 minutes
    cron.default.schedule("*/5 * * * *", runAutoComplete);

    console.log(
      "✅ Auto-complete scheduler started (every 5 minutes with node-cron)",
    );
  } catch {
    // node-cron not installed, try setInterval instead
    console.log(
      "⚠️  node-cron not found. Using setInterval (5 minutes) instead.",
    );

    // Run every 5 minutes = 5 * 60 * 1000 milliseconds
    setInterval(runAutoComplete, 5 * 60 * 1000);

    console.log("✅ Auto-complete scheduler started (every 5 minutes)");
  }
}

/**
 * Alternative: Manual schedule options
 *
 * For development:
 * - Use the admin dashboard button (manual trigger)
 *
 * For production:
 * - Use Vercel Cron (add to vercel.json)
 * - Use external service (EasyCron, AWS Lambda, etc.)
 * - Use node-cron with this scheduler
 *
 * Cron schedule examples:
 * '*/5 * * * *'  = Every 5 minutes
 * '*/15 * * * *' = Every 15 minutes
 * '0 * * * *'    = Every hour
 * '0 */6 * * *'  = Every 6 hours
 */
