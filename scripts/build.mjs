#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

console.log(`\n🚀 Building for ${isProduction ? 'PRODUCTION (PostgreSQL)' : 'DEVELOPMENT (SQLite)'}...\n`);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const pgSchemaPath = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const sqliteSchemaPath = path.join(__dirname, '../prisma/schema.sqlite.prisma');

try {
  if (isProduction) {
    // Backup current SQLite schema if not already backed up
    if (!fs.existsSync(sqliteSchemaPath)) {
      console.log('📦 Backing up SQLite schema...');
      fs.copyFileSync(schemaPath, sqliteSchemaPath);
    }
    
    // Use PostgreSQL schema for production
    if (fs.existsSync(pgSchemaPath)) {
      console.log('🔄 Switching to PostgreSQL schema...');
      fs.copyFileSync(pgSchemaPath, schemaPath);
    } else {
      console.warn('⚠️  PostgreSQL schema not found, using default schema');
    }
  }
  
  // Generate Prisma client
  console.log('⚙️  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build Next.js
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!\n');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
