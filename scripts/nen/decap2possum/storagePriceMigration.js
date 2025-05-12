import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";

// Promisify fs methods for async/await
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

// Get current directory path (for ES modules)
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Path configuration
const INPUT_DIR = path.join(
  dirname,
  "../../../_data",
  "productosCategoriasDecap"
);

async function processFiles() {
  try {
    const files = await readdir(INPUT_DIR);

    for (const file of files) {
      if (path.extname(file) !== '.json') continue;

      const filePath = path.join(INPUT_DIR, file);
      const data = await readFile(filePath, 'utf8');
      let product = JSON.parse(data);

      // Only process if product has storage options
      if (product.almacenamiento && Array.isArray(product.almacenamiento)) {
        let modified = false;

        product.almacenamiento = product.almacenamiento.map(storage => {
          if (!storage.hasOwnProperty('precio')) {
            modified = true;
            return { ...storage, precio: '0' };
          }
          return storage;
        });

        if (modified) {
          await writeFile(
            filePath,
            JSON.stringify(product, null, 2),
            'utf8'
          );
          console.log(`Updated ${file}`);
        } else {
          console.log(`No changes needed for ${file}`);
        }
      }
    }

    console.log('Processing complete!');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the script
processFiles();
