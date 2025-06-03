import { reverseTransformBanner, transformBanner } from './banner.js';
import { transformCategories, reverseTransformCategories } from './categories.js';
import { transformProducts, reverseTransformProducts } from './products.js';

async function runTransformations() {
  // Get command line arguments (skip first two which are node and script path)
  const args = process.argv.slice(2);
  const mode = args[0] || 'transform'; // Default to transform if no argument

  try {
    console.log('🐀🎈 Starting transformations...');

    switch (mode.toLowerCase()) {
      case 'transform':
        await transformCategories();
        console.log('🐀🎈 Category transformation complete');
        await transformProducts();
        console.log('🐀🎈 Product transformation complete');
        await transformBanner();
        console.log('🐀🎈 Banner transformation complete');
        break;

      case 'reverse':
        await reverseTransformCategories();
        console.log('🐀🎈 Reverse category transformation complete');
        await reverseTransformProducts();
        console.log('🐀🎈 Reverse product transformation complete');
        await reverseTransformBanner();
        console.log('🐀🎈 Reverse banner transformation complete');
        break;

      case 'transform-categories':
        await transformCategories();
        console.log('🐀🎈 Category transformation complete');
        break;

      case 'reverse-categories':
        await reverseTransformCategories();
        console.log('🐀🎈 Reverse category transformation complete');
        break;

      case 'transform-products':
        await transformProducts();
        console.log('🐀🎈 Product transformation complete');
        break;

      case 'reverse-products':
        await reverseTransformProducts();
        console.log('🐀🎈 Reverse product transformation complete');
        break;

      case 'transform-banner':
        await transformBanner();
        console.log('🐀🎈 Banner transformation complete');
        break;

      case 'reverse-banner':
        await reverseTransformBanner();
        console.log('🐀🎈 Reverse banner transformation complete');
        break;

      default:
        console.error('🐀🎈 Invalid mode. Available options:');
        console.error('  transform (default) - Run normal transformations');
        console.error('  reverse - Run reverse transformations');
        console.error('  transform-categories - Only transform categories');
        console.error('  reverse-categories - Only reverse transform categories');
        console.error('  transform-products - Only transform products');
        console.error('  reverse-products - Only reverse transform products');
        process.exit(1);
    }

    console.log('🐀🎈 Operations completed successfully!');
  } catch (err) {
    console.error('🐀🎈 Operation failed:', err);
    process.exit(1); // Exit with error code
  }
}

// Execute
runTransformations();
