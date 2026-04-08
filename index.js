#!/usr/bin/env node

const { Select, Input } = require('enquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log('✨ Welcome to Create-Sparkly! ✨\n');

  try {
    const templatesDir = path.join(__dirname, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      throw new Error(`Templates directory not found at ${templatesDir}`);
    }

    const availableTemplates = fs.readdirSync(templatesDir);

    const templatePrompt = new Select({
      name: 'template',
      message: 'Pick a flavour:',
      choices: availableTemplates
    });

    const dirPrompt = new Input({
      name: 'dir',
      message: 'App name:',
      initial: 'my-sparkly-app',
      // Added basic validation to the prompt itself
      validate(value) {
        if (value.length === 0) return 'App name cannot be empty.';
        return true;
      }
    });

    const selectedTemplate = await templatePrompt.run();
    const rawDirName = await dirPrompt.run();

    /**
     * SECURITY FIX: CWE-22 (Path Traversal)
     * 1. path.basename() strips any leading path info (e.g., ../../../)
     * 2. replace() ensures only safe filename characters are used
     */
    const sanitizedDirName = path.basename(rawDirName).replace(/[^a-z0-9-_]/gi, '');
    
    if (!sanitizedDirName) {
      throw new Error('Invalid app name. Please use alphanumeric characters, hyphens, or underscores.');
    }

    const destination = path.resolve(process.cwd(), sanitizedDirName);

    // Check if directory already exists to prevent accidental overwrites
    if (fs.existsSync(destination)) {
      throw new Error(`Directory "${sanitizedDirName}" already exists. Please choose a different name.`);
    }

    const source = path.join(templatesDir, selectedTemplate);

    console.log(`\n🚚 Copying ${selectedTemplate} to ${sanitizedDirName}...`);
    
    // Ensure destination exists
    fs.mkdirSync(destination, { recursive: true });

    // Copying files
    fs.cpSync(source, destination, { recursive: true });

    console.log('📦 Installing dependencies (this might take a second)...');
    
    try {
      execSync('npm install', { 
        cwd: destination, 
        stdio: 'inherit' 
      });
      
      console.log('\n✅ Success! Your project is ready.');
      console.log(`\nNext steps:\n  cd ${sanitizedDirName}\n  npm start`);
    } catch (installErr) {
      console.error('\n⚠️  Files copied, but npm install failed. Try running it manually.');
    }

  } catch (err) {
    // Enquirer throws an empty string on Ctrl+C / Cancel
    if (err === '') {
      console.log('\n👋 Installation cancelled.');
      return;
    }
    console.error('\n❌ Error:', err.message || err);
    process.exit(1);
  }
}

run();
