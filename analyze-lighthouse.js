const fs = require('fs');

// Read the optimized report
const report = JSON.parse(fs.readFileSync('lighthouse-report-optimized.json', 'utf8'));

console.log('=== LIGHTHOUSE AUDIT RESULTS (OPTIMIZED BUILD) ===\n');

// Scores
console.log('SCORES:');
console.log('  Performance:', report.categories.performance.score * 100);
console.log('  Best Practices:', report.categories['best-practices'].score * 100);
console.log('');

// Key Metrics
console.log('KEY METRICS:');
const audits = report.audits;
console.log('  FCP (First Contentful Paint):', audits['first-contentful-paint'].displayValue);
console.log('  LCP (Largest Contentful Paint):', audits['largest-contentful-paint'].displayValue);
console.log('  TTI (Time to Interactive):', audits['interactive'].displayValue);
console.log('  TBT (Total Blocking Time):', audits['total-blocking-time'].displayValue);
console.log('  CLS (Cumulative Layout Shift):', audits['cumulative-layout-shift'].displayValue);
console.log('  Speed Index:', audits['speed-index'].displayValue);
console.log('');

// Performance Opportunities
console.log('=== TOP PERFORMANCE OPPORTUNITIES ===\n');
const opportunities = Object.entries(audits)
    .filter(([key, audit]) =>
        audit.details &&
        audit.details.type === 'opportunity' &&
        audit.score !== null &&
        audit.score < 1
    )
    .sort((a, b) => (b[1].numericValue || 0) - (a[1].numericValue || 0));

opportunities.slice(0, 10).forEach(([key, audit]) => {
    console.log(`${audit.title}`);
    console.log(`  Score: ${(audit.score * 100).toFixed(0)}%`);
    console.log(`  Potential Savings: ${audit.displayValue || 'N/A'}`);
    console.log('');
});

// Diagnostics
console.log('=== DIAGNOSTICS (Issues to Address) ===\n');
const diagnostics = Object.entries(audits)
    .filter(([key, audit]) =>
        audit.details &&
        audit.details.type === 'debugdata' &&
        audit.score !== null &&
        audit.score < 1
    );

diagnostics.slice(0, 5).forEach(([key, audit]) => {
    console.log(`${audit.title}`);
    console.log(`  Score: ${(audit.score * 100).toFixed(0)}%`);
    console.log('');
});

// Failed Audits
console.log('=== FAILED AUDITS ===\n');
const failed = Object.entries(audits)
    .filter(([key, audit]) => audit.score !== null && audit.score === 0);

failed.forEach(([key, audit]) => {
    console.log(`❌ ${audit.title}`);
    console.log(`   ${audit.description}`);
    console.log('');
});
