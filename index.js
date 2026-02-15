#!/usr/bin/env node

const { Select, Input } = require('enquirer'); // Modern, beautiful prompts
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log('✨ Welcome to Create-Sparkly! ✨\n');

  try {
    // 1. Define your available templates
    const templatesDir = path.join(__dirname, 'templates');
    
    // Auto-detect folders in /templates or hardcode them:
    const availableTemplates = fs.readdirSync(templatesDir);

    // 2. Start the Prompts
    const templatePrompt = new Select({
      name: 'template',
      message: 'Pick a flavour:',
      choices: availableTemplates // ['basic', 'advanced', 'pro']
    });

    const dirPrompt = new Input({
      name: 'dir',
      message: 'App name:',
      initial: 'my-sparkly-app'
    });

    const selectedTemplate = await templatePrompt.run();
    const targetDirName = await dirPrompt.run();

    // 3. Define Paths
    const source = path.join(templatesDir, selectedTemplate);
    const destination = path.resolve(process.cwd(), targetDirName);

    // 4. Copy Files
    console.log(`\n🚚 Copying ${selectedTemplate} to ${targetDirName}...`);
    
    // Ensure destination exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    // Copying (Node 16.7+)
    fs.cpSync(source, destination, { recursive: true });

    // 5. Run NPM Install
    console.log('📦 Installing dependencies (this might take a second)...');
    
    try {
      execSync('npm install', { 
        cwd: destination, 
        stdio: 'inherit' // This shows the npm progress in the terminal
      });
      
      console.log('\n✅ Success! Your project is ready.');
      console.log(`\nNext steps:\n  cd ${targetDirName}\n  npm start`);
    } catch (installErr) {
      console.error('⚠️  Files copied, but npm install failed. Try running it manually.');
    }

  } catch (err) {
    if (err === '') return; // Handle Ctrl+C (Enquirer throws empty string)
    console.error('❌ Error:', err);
  }
}

run();