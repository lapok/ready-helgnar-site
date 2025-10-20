#!/usr/bin/env node

/**
 * WebP Conversion Script for Helgnar Site
 * Converts all JPG/PNG images to WebP format
 * 
 * Requirements:
 * - Node.js
 * - sharp package: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
  inputDir: './assets',
  outputDir: './assets',
  quality: 85,
  formats: ['jpg', 'jpeg', 'png']
};

// Statistics
let stats = {
  processed: 0,
  skipped: 0,
  errors: 0
};

/**
 * Recursively find all image files
 */
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase().slice(1);
      if (config.formats.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Convert single image to WebP
 */
async function convertToWebP(inputPath) {
  try {
    const ext = path.extname(inputPath);
    const webpPath = inputPath.replace(new RegExp(ext + '$'), '.webp');
    
    // Skip if WebP already exists and is newer
    if (fs.existsSync(webpPath)) {
      const inputStat = fs.statSync(inputPath);
      const webpStat = fs.statSync(webpPath);
      
      if (webpStat.mtime > inputStat.mtime) {
        console.log(`⏭️  Skipped (up to date): ${path.relative(process.cwd(), inputPath)}`);
        stats.skipped++;
        return;
      }
    }
    
    console.log(`🔄 Converting: ${path.relative(process.cwd(), inputPath)}`);
    
    await sharp(inputPath)
      .webp({ 
        quality: config.quality,
        effort: 6 // Maximum compression effort
      })
      .toFile(webpPath);
    
    console.log(`✅ Created: ${path.relative(process.cwd(), webpPath)}`);
    stats.processed++;
    
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main conversion function
 */
async function convertAllImages() {
  console.log('🚀 Starting WebP conversion...\n');
  
  if (!fs.existsSync(config.inputDir)) {
    console.error(`❌ Input directory not found: ${config.inputDir}`);
    process.exit(1);
  }
  
  const imageFiles = findImageFiles(config.inputDir);
  
  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found to convert');
    return;
  }
  
  console.log(`📁 Found ${imageFiles.length} images to process\n`);
  
  // Process images in batches to avoid memory issues
  const batchSize = 5;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    await Promise.all(batch.map(convertToWebP));
  }
  
  // Print statistics
  console.log('\n📊 Conversion Statistics:');
  console.log(`✅ Processed: ${stats.processed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log(`📁 Total: ${imageFiles.length}`);
  
  if (stats.errors === 0) {
    console.log('\n🎉 All images converted successfully!');
  } else {
    console.log(`\n⚠️  ${stats.errors} errors occurred during conversion`);
  }
}

// Run conversion
convertAllImages().catch(console.error);
