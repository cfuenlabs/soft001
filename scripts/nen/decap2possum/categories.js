import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path (for ES modules)
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Path configuration
const INPUT_DIR = path.join(dirname, '../../../_data', 'categoriasDecap');
const OUTPUT_FILE = path.join(dirname, '../../../_data', 'categorias.json');

async function transformCategories() {
  try {
    // Get all JSON files in the input directory
    const files = (await fs.readdir(INPUT_DIR)).filter(file => file.endsWith('.json'));

    const categories = [];

    for (const file of files) {
      const filePath = path.join(INPUT_DIR, file);
      const rawData = await fs.readFile(filePath, 'utf8');
      const categoryData = JSON.parse(rawData);

      // Add the category name to our array
      if (categoryData.nombre) {
        categories.push(categoryData.nombre);
      }
    }

    // Sort categories alphabetically
    categories.sort((a, b) => a.localeCompare(b));

    // Write the transformed array to the output file
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(categories, null, 2)
    );

    console.log(`Successfully transformed ${files.length} categories to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error during category transformation:', error);
    throw error; // Re-throw for module consumers
  }
}

async function reverseTransformCategories() {
  try {
    // Read the unified file
    const rawData = await fs.readFile(OUTPUT_FILE, 'utf8');
    const categories = JSON.parse(rawData);

    // Ensure the input directory exists
    await fs.mkdir(INPUT_DIR, { recursive: true });

    // Create a JSON file for each category
    for (const category of categories) {
      const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.json`;
      const filePath = path.join(INPUT_DIR, fileName);

      const categoryData = {
        nombre: category,
        // You can add other default properties here if needed
      };

      await fs.writeFile(
        filePath,
        JSON.stringify(categoryData, null, 2)
      );
    }

    console.log(`Successfully created ${categories.length} category files in ${INPUT_DIR}`);

  } catch (error) {
    console.error('Error during reverse transformation:', error);
    throw error;
  }
}

// Export as both default and named export
export { transformCategories, reverseTransformCategories };
