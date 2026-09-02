export async function register() {
  // Only run in the Node.js server runtime, not the Edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedDemoDataIfEmpty } = await import("./app/utils/seedDemoData.js");
    await seedDemoDataIfEmpty();
  }
}
