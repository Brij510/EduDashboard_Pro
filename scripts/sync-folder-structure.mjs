import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourcePath = path.join(projectRoot, "folder-structure.json");
const targetPath = path.join(projectRoot, "public", "folder-structure.json");

const run = async () => {
  let sourceRaw;
  try {
    sourceRaw = await fs.readFile(sourcePath, "utf-8");
  } catch (error) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  try {
    JSON.parse(sourceRaw);
  } catch {
    throw new Error("folder-structure.json is not valid JSON");
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, sourceRaw);
  console.log("Synced folder structure to public/");
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
