const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public', 'background');
const outputDir = path.join(inputDir, 'thumbnails');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach((file, _index) => {
    // Only process jpg/png
    if (!file.match(/\.(jpg|jpeg|png)$/i)) {
      return;
    }

    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    sharp(inputPath)
      .resize(400) // resize width to 400px, auto height
      .jpeg({ quality: 60 }) // compress for fast loading
      .toFile(outputPath)
      .then(_info => {
        console.log(`Generated thumbnail for ${file}`);
      })
      .catch(err => {
        console.error(`Error processing ${file}:`, err);
      });
  });
});
