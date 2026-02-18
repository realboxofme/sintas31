#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

console.log(`\n🚀 Building for ${isProduction ? 'PRODUCTION (PostgreSQL)' : 'DEVELOPMENT (MySQL)'}...\n`);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const pgSchemaPath = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const mysqlSchemaPath = path.join(__dirname, '../prisma/schema.mysql.prisma');

try {
  if (isProduction) {
    // Backup current MySQL schema if not already backed up
    if (!fs.existsSync(mysqlSchemaPath)) {
      console.log('📦 Backing up MySQL schema...');
      fs.copyFileSync(schemaPath, mysqlSchemaPath);
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
