'use strict'

const { performance } = require('perf_hooks')
const { mergeRules } = require('../src/rules')

// 🔧 Benchmark Configuration
const CONFIG = {
  // Test scenario size
  BASE_RULES_COUNT: 2_000,
  INLINE_RULES_COUNT: 1_000,

  // Performance test settings
  BENCHMARK_ITERATIONS: 1000,
  WARMUP_ITERATIONS: 10,

  // Memory test settings
  MEMORY_TEST_ITERATIONS: 100
}

// Helper to create mock rules
const createMockRules = (count, prefix = 'prop') => {
  const rules = {}
  for (let i = 0; i < count; i++) {
    rules[`${prefix}${i}`] = [() => `value${i}`]
  }
  return rules
}

// Helper to create base rules (array of [propName, rules] pairs)
const createBaseRules = (count, prefix = 'base') => {
  const baseRules = []
  for (let i = 0; i < count; i++) {
    baseRules.push([`${prefix}${i}`, [() => `baseValue${i}`]])
  }
  return baseRules
}

// Benchmark function
const benchmark = (fn, iterations = CONFIG.BENCHMARK_ITERATIONS) => {
  // Warmup
  for (let i = 0; i < CONFIG.WARMUP_ITERATIONS; i++) fn()

  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()

  const totalTime = end - start
  const avgTime = totalTime / iterations
  return { totalTime, avgTime, iterations }
}

console.log('┌────────────────────────────────────────────────┐')
console.log('│            MergeRules Benchmark                │')
console.log('└────────────────────────────────────────────────┘\n')

// Large comprehensive test case
const baseRules = createBaseRules(CONFIG.BASE_RULES_COUNT)
const inlineRules = [createMockRules(CONFIG.INLINE_RULES_COUNT, 'inline')]

console.log('📊 Test Scenario')
console.log('─'.repeat(50))
console.log(`• Base Rules:   ${CONFIG.BASE_RULES_COUNT} properties`)
console.log(`• Inline Rules: ${CONFIG.INLINE_RULES_COUNT} properties`)
console.log(`• Iterations:   ${CONFIG.BENCHMARK_ITERATIONS}`)
console.log(
  `• Expected:     ~${
    CONFIG.BASE_RULES_COUNT + CONFIG.INLINE_RULES_COUNT
  } final rules (some overlap)`
)

console.log('\n⏱️  Running benchmark...')

// Run the benchmark
const result = benchmark(() => mergeRules(inlineRules, baseRules))

console.log('\n📈 Performance Results')
console.log('─'.repeat(50))
console.log(`Total Time:    ${result.totalTime.toFixed(2)}ms`)
console.log(`Average Time:  ${result.avgTime.toFixed(4)}ms per operation`)
console.log(`Operations/sec: ${(1000 / result.avgTime).toFixed(0)} ops/sec`)

// Memory test
console.log('\n💾 Memory Impact')
console.log('─'.repeat(50))

// Force garbage collection if available (run with --expose-gc for more accurate results)
if (global.gc) {
  global.gc()
  console.log('• Forced garbage collection before test')
}

// Take multiple baseline measurements
const baselineMeasurements = []
for (let i = 0; i < 5; i++) {
  baselineMeasurements.push(process.memoryUsage().heapUsed)
}
const memBefore = Math.min(...baselineMeasurements)

// Create objects that will persist during measurement
const persistentResults = []

// Run operations and keep references to prevent GC
for (let i = 0; i < CONFIG.MEMORY_TEST_ITERATIONS; i++) {
  const result = mergeRules(inlineRules, baseRules)
  // Keep reference to prevent immediate GC
  if (i % 10 === 0) persistentResults.push(result)
}

// Take multiple measurements after
const afterMeasurements = []
for (let i = 0; i < 5; i++) {
  afterMeasurements.push(process.memoryUsage().heapUsed)
}
const memAfter = Math.max(...afterMeasurements)

const memIncrease = memAfter - memBefore

if (memIncrease > 0) {
  console.log(
    `Memory per ${CONFIG.MEMORY_TEST_ITERATIONS} ops: ${(
      memIncrease /
      1024 /
      1024
    ).toFixed(2)} MB`
  )
  console.log(
    `Memory per op:      ${(
      memIncrease /
      CONFIG.MEMORY_TEST_ITERATIONS /
      1024
    ).toFixed(2)} KB`
  )
} else {
  console.log(
    `Memory change: ${(memIncrease / 1024 / 1024).toFixed(
      2
    )} MB (GC likely occurred)`
  )
  console.log(
    '💡 Run with --expose-gc flag for more accurate memory measurement'
  )
}

// Clean up references
persistentResults.length = 0

console.log('\n✅ Benchmark Complete!')
console.log('\n💡 Use this to compare before/after optimization performance')
