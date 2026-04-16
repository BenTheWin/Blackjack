// Run with: node tests/game.test.js
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  try { fn(); } catch (e) { console.error(`  ✗ THREW: ${e.message}`); failed++; }
}

// Tests added in Tasks 2–4

process.on('exit', () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});
