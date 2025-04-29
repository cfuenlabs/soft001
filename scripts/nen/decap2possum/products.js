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
const INPUT_DIR = path.join(
  dirname,
  "../../../_data",
  "productosCategoriasDecap"
);
const OUTPUT_FILE = path.join(
  dirname,
  "../../../_data",
  "productosCategorias.json"
);

async function transformProducts() {
  try {
    // Get all JSON files in the input directory
    const files = (await readdir(INPUT_DIR)).filter((file) =>
      file.endsWith(".json")
    );

    const transformedProducts = [];

    for (const file of files) {
      const filePath = path.join(INPUT_DIR, file);
      const rawData = await readFile(filePath, "utf8");
      const productData = JSON.parse(rawData);

      // Base product structure
      const product = {
        nombre: productData.nombre,
        precio: productData.precio.toString(), // Convert to string as in target format
        categoria: productData.categoria,
      };

      // Simple product with storage options
      if (productData.almacenamiento && productData.almacenamiento.length > 0) {
        product.almacenamiento = productData.almacenamiento.map(
          (item) => item.almacenamiento
        );
      }

      // Handle different product types
      if (productData.tipo === "con colores") {
        // Colored product transformation
        product.colores = productData.colores.map((color) => ({
          name: color.name.toLowerCase().replace(/\s+/g, "-"), // Convert to lowercase with hyphens
          hex: color.hex,
        }));

        product.imagenes = productData.imagenes_colores.map((img) => ({
          path: img.path.replace("/public", ""), // Clean path
          color: img.color.toLowerCase().replace(/\s+/g, "-"), // Match color name format
        }));
      } else if (productData.tipo === "simple") {
        // Handle main image
        if (productData.imagen_principal) {
          product.imagen = productData.imagen_principal.replace(
            "/public",
            ""
          );
        }
      }

      transformedProducts.push(product);
    }

    // Write the transformed array to the output file
    await writeFile(OUTPUT_FILE, "");
    await writeFile(OUTPUT_FILE, JSON.stringify(transformedProducts, null, 2));

    console.log(
      `Successfully transformed ${files.length} products to ${OUTPUT_FILE}`
    );
  } catch (error) {
    console.error("Error during transformation:", error);
  }
}

async function reverseTransformProducts() {
  try {
    // Read the unified file
    const rawData = await readFile(OUTPUT_FILE, "utf8");
    const products = JSON.parse(rawData);

    // Ensure the input directory exists
    await mkdir(INPUT_DIR, { recursive: true });

    // Create a JSON file for each product
    for (const product of products) {
      // Generate filename from product name
      const fileName = `${product.categoria
        .toLowerCase()
        .replace(/\s+/g, "-")}-${product.nombre
        .toLowerCase()
        .replace(/\s+/g, "-")}.json`;
      const filePath = path.join(INPUT_DIR, fileName);

      // Reconstruct the original product structure
      const originalProduct = {
        nombre: product.nombre,
        precio: parseFloat(product.precio), // Convert back to number
        categoria: product.categoria,
      };

      if (product.almacenamiento && product.almacenamiento.length > 0) {
        originalProduct.almacenamiento = product.almacenamiento.map((item) => ({
          almacenamiento: item,
        }));
      }

      // Determine product type based on available properties
      if (product.colores && product.colores.length > 0) {
        // Colored product
        originalProduct.tipo = "con colores";
        originalProduct.colores = product.colores.map((color) => ({
          name: color.name, // Keep the transformed name or add logic to reverse it
          hex: color.hex,
        }));

        originalProduct.imagenes_colores = product.imagenes.map((img) => ({
          path: `/public${img.path}`, // Restore original path format
          color: img.color, // Keep the transformed color name
        }));
      } else {
        // Simple product
        originalProduct.tipo = "simple";

        if (product.imagen && product.imagen.length > 0) {
          originalProduct.imagen_principal = `/public${product.imagen}`;
        }
      }

      await writeFile(filePath, JSON.stringify(originalProduct, null, 2));
    }

    console.log(
      `Successfully created ${products.length} product files in ${INPUT_DIR}`
    );
  } catch (error) {
    console.error("Error during reverse transformation:", error);
    throw error;
  }
}

export { transformProducts, reverseTransformProducts };
