import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";

// Promisify fs methods for async/await
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

// Get current directory path (for ES modules)
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Path configuration
const INPUT_DIR = path.join(dirname, "../../../_data", "bannerDecap");
const OUTPUT_FILE = path.join(dirname, "../../../_data", "banner.json");

async function transformBanner() {
  try {
    // Get all JSON files in the input directory
    const files = (await readdir(INPUT_DIR)).filter((file) =>
      file.endsWith(".json")
    );

    const transformedBanners = [];

    for (const file of files) {
      const filePath = path.join(INPUT_DIR, file);
      const rawData = await readFile(filePath, "utf8");
      const bannerData = JSON.parse(rawData);

      // Base banner structure
      const banner = {
        id: bannerData.id,
        img: bannerData.img.replace("/public", ""),
      };

      transformedBanners.push(banner);
    }

    // Write the transformed array to the output file
    await writeFile(OUTPUT_FILE, "");
    await writeFile(OUTPUT_FILE, JSON.stringify(transformedBanners, null, 2));

    console.log(
      `Successfully transformed ${files.length} banners to ${OUTPUT_FILE}`
    );
  } catch (error) {
    console.error("Error during transformation:", error);
  }
}

async function reverseTransformBanner() {
  try {
    // Read the unified file
    const rawData = await readFile(OUTPUT_FILE, "utf8");
    const banners = JSON.parse(rawData);

    // Ensure the input directory exists
    await mkdir(INPUT_DIR, { recursive: true });

    // Create a JSON file for each banner
    for (const banner of banners) {
      // Generate filename from banner name
      const fileName = `${banner.id}.json`;
      const filePath = path.join(INPUT_DIR, fileName);

      // Reconstruct the original banner structure
      const originalBanner = {
        id: banner.id,
        img: banner.img.replace("/public", ""),
      };

      await writeFile(filePath, JSON.stringify(originalBanner, null, 2));
    }

    console.log(
      `Successfully created ${banners.length} banner files in ${INPUT_DIR}`
    );
  } catch (error) {
    console.error("Error during reverse transformation:", error);
    throw error;
  }
}

export { transformBanner, reverseTransformBanner };
