#!/usr/bin/env node

/**
 * Memory Check Script
 * Checks current memory usage of the application
 */

const { execSync } = require('child_process');
const os = require('os');

function getMemoryStats() {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    used: Math.round(usedMem / 1024 / 1024), // MB
    total: Math.round(totalMem / 1024 / 1024), // MB
    percentage: Math.round((usedMem / totalMem) * 100),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024) // MB
  };
}

function getMemoryWarning(stats) {
  if (stats.percentage > 90) {
    return `Critical: ${stats.percentage}% memory usage (${stats.used}MB/${stats.total}MB)`;
  } else if (stats.percentage > 80) {
    return `Warning: ${stats.percentage}% memory usage (${stats.used}MB/${stats.total}MB)`;
  }
  return null;
}

const stats = getMemoryStats();

console.log('📊 Memory Usage:');
console.log(`   Total: ${stats.total}MB`);
console.log(`   Used: ${stats.used}MB (${stats.percentage}%)`);
console.log(`   Heap: ${stats.heapUsed}MB/${stats.heapTotal}MB`);
console.log(`   External: ${stats.external}MB`);

const warning = getMemoryWarning(stats);
if (warning) {
  console.log('⚠️', warning);
} else {
  console.log('✅ Memory usage is normal');
}
