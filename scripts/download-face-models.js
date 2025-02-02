const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
const PACKAGE_MODELS_DIR = path.join(process.cwd(), 'node_modules', '@vladmandic', 'face-api', 'model');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${path.basename(src)}`);
  } catch (error) {
    throw new Error(`Failed to copy ${path.basename(src)}: ${error.message}`);
  }
}

function copyModels() {
  console.log('Copying face detection models...');
  try {
    // Clear existing models
    if (fs.existsSync(MODELS_DIR)) {
      fs.rmSync(MODELS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(MODELS_DIR, { recursive: true });

    // Get all files from the package's model directory
    const files = fs.readdirSync(PACKAGE_MODELS_DIR);

    // Copy each file
    files.forEach(file => {
      const srcPath = path.join(PACKAGE_MODELS_DIR, file);
      const destPath = path.join(MODELS_DIR, file);
      copyFile(srcPath, destPath);
    });

    console.log('All models copied successfully!');
  } catch (error) {
    console.error('Error copying models:', error);
    process.exit(1);
  }
}

copyModels(); 