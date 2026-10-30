import { readdir } from "node:fs/promises";

// Mod jars for the team to test before a release, put there by hand. Outside
// the repo and the public folder, so only the team route can serve them.
export const TEST_BUILDS_DIR = "/opt/ticklog/test-builds";

export async function listTestBuilds() {
  const files = await readdir(TEST_BUILDS_DIR).catch(() => []);
  return files.filter((f) => /^ticklog-[\w.+-]+\.jar$/.test(f)).sort();
}
