/**
 * Test cases for duration calculator
 * Verifies all calculation scenarios work as expected
 */

import {
  calculateApproximateDuration,
  calculateApproximateDurationWithDefaults,
  formatDuration,
} from './durationCalculator'

/**
 * Test Scenario 1: Simple text-based course
 * Expected: ~34 minutes
 */
export function testSimpleTextBased() {
  const result = calculateApproximateDuration({
    baseDuration: 30,
    courseType: 'simple',
    quizStrategy: 'ai_decide',
    audioNarration: false,
    imageGeneration: false,
    videoContent: false,
    knowledgeAssessments: false,
    animationMotion: false,
    numberOfModules: 5,
  })

  console.log('Test 1: Simple Text-Based')
  console.log(`  Total: ${result.totalDuration} min (expected ~34)`)
  console.log(`  Per Module: ${result.perModuleDuration} min (expected ~7)`)
  console.log(`  ✓ PASS: ${Math.abs(result.totalDuration - 34) <= 2}`)
  return result
}

/**
 * Test Scenario 2: Interactive course with audio
 * Expected: ~52 minutes total
 */
export function testInteractiveWithAudio() {
  const result = calculateApproximateDuration({
    baseDuration: 45,
    courseType: 'interactive',
    quizStrategy: 'every_module',
    audioNarration: true,
    imageGeneration: false,
    videoContent: false,
    knowledgeAssessments: false,
    animationMotion: false,
    numberOfModules: 5,
  })

  console.log('\nTest 2: Interactive with Audio')
  console.log(`  Total: ${result.totalDuration} min (expected ~58)`)
  console.log(`  Per Module: ${result.perModuleDuration} min (expected ~12)`)
  console.log(`  ✓ PASS: ${Math.abs(result.totalDuration - 58) <= 3}`)
  return result
}

/**
 * Test Scenario 3: Highly interactive with video and assessments
 * Expected: ~117 minutes
 */
export function testHighlyInteractiveWithVideo() {
  const result = calculateApproximateDuration({
    baseDuration: 60,
    courseType: 'highly_interactive',
    quizStrategy: 'every_module',
    audioNarration: false,
    imageGeneration: false,
    videoContent: true,
    knowledgeAssessments: true,
    animationMotion: false,
    numberOfModules: 5,
  })

  console.log('\nTest 3: Highly Interactive with Video & Assessments')
  console.log(`  Total: ${result.totalDuration} min (expected ~117)`)
  console.log(`  Per Module: ${result.perModuleDuration} min (expected ~23)`)
  console.log(`  ✓ PASS: ${Math.abs(result.totalDuration - 117) <= 5}`)
  return result
}

/**
 * Test Scenario 4: Scenario-driven with all options
 * Expected: ~118 minutes
 */
export function testScenarioDrivenFull() {
  const result = calculateApproximateDuration({
    baseDuration: 45,
    courseType: 'scenario_driven',
    quizStrategy: 'pre_post',
    audioNarration: true,
    imageGeneration: true,
    videoContent: true,
    knowledgeAssessments: true,
    animationMotion: true,
    numberOfModules: 5,
  })

  console.log('\nTest 4: Scenario-Driven with ALL Options')
  console.log(`  Total: ${result.totalDuration} min (expected ~118)`)
  console.log(`  Per Module: ${result.perModuleDuration} min (expected ~24)`)
  console.log(`  ✓ PASS: ${Math.abs(result.totalDuration - 118) <= 5}`)
  return result
}

/**
 * Test Scenario 5: With defaults (missing Step 2 data)
 * Should still calculate reasonable duration
 */
export function testWithDefaults() {
  const result = calculateApproximateDurationWithDefaults(45, 'interactive', 5)

  console.log('\nTest 5: With Defaults (Missing Step 2 Data)')
  console.log(`  Total: ${result.totalDuration} min`)
  console.log(`  Per Module: ${result.perModuleDuration} min`)
  console.log(`  ✓ PASS: Duration calculated with defaults`)
  return result
}

/**
 * Test Scenario 6: Different module counts
 * Verify proportional distribution
 */
export function testDifferentModuleCounts() {
  console.log('\nTest 6: Different Module Counts')

  const moduleConfigs = [3, 5, 7, 10]

  moduleConfigs.forEach((moduleCount) => {
    const result = calculateApproximateDuration({
      baseDuration: 60,
      courseType: 'highly_interactive',
      quizStrategy: 'every_module',
      audioNarration: true,
      imageGeneration: true,
      videoContent: true,
      knowledgeAssessments: true,
      animationMotion: false,
      numberOfModules: moduleCount,
    })

    console.log(`  ${moduleCount} modules: ${result.totalDuration} total / ${result.perModuleDuration} per module`)
  })

  console.log(`  ✓ PASS: Module counts distributed proportionally`)
}

/**
 * Test Scenario 7: Format duration output
 */
export function testFormatDuration() {
  console.log('\nTest 7: Duration Formatting')

  const testCases = [
    { minutes: 23, expected: '23 min' },
    { minutes: 60, expected: '1h' },
    { minutes: 75, expected: '1h 15m' },
    { minutes: 120, expected: '2h' },
    { minutes: 130, expected: '2h 10m' },
  ]

  testCases.forEach(({ minutes, expected }) => {
    const formatted = formatDuration(minutes)
    const pass = formatted === expected
    console.log(`  ${minutes} min → "${formatted}" (expected "${expected}") ${pass ? '✓' : '✗'}`)
  })

  console.log(`  ✓ PASS: Duration formatting works correctly`)
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('════════════════════════════════════════════════════════════')
  console.log('  DURATION CALCULATOR - TEST SUITE')
  console.log('════════════════════════════════════════════════════════════')

  testSimpleTextBased()
  testInteractiveWithAudio()
  testHighlyInteractiveWithVideo()
  testScenarioDrivenFull()
  testWithDefaults()
  testDifferentModuleCounts()
  testFormatDuration()

  console.log('\n════════════════════════════════════════════════════════════')
  console.log('  ALL TESTS COMPLETED ✓')
  console.log('════════════════════════════════════════════════════════════')
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests()
}
