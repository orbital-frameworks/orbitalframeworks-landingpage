import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const stylesheet = readFileSync(new URL('../src/ProofHubPage.css', import.meta.url), 'utf8')
const getRule = (selector) => stylesheet
  .split(selector + ' {')
  .slice(1)
  .map((part) => part.split('}')[0])
  .join(' ')

test('evidence desktop typography is bounded and editorial columns share vertical space', () => {
  const hero = getRule('.proofHero')
  const heroTitle = getRule('.proofHero h1')
  const workHead = getRule('.proofSectionHead')
  const workTitle = getRule('.proofSectionHead h2')
  assert.match(hero, /align-items:\s*center/)
  assert.match(workHead, /align-items:\s*center/)
  assert.match(heroTitle, /font-size:\s*clamp\([^;]+,\s*88px\)/)
  assert.match(workTitle, /font-size:\s*clamp\([^;]+,\s*70px\)/)
  assert.match(workTitle, /max-width:\s*22ch/)
})

test('evidence headings have separate mobile sizing', () => {
  assert.match(stylesheet, /@media\s*\(max-width:640px\)[\s\S]*\.proofHero h1\s*\{[^}]*font-size:\s*clamp\(47px,12\.5vw,62px\)/)
  assert.match(stylesheet, /@media\s*\(max-width:640px\)[\s\S]*\.proofSectionHead h2\s*\{[^}]*font-size:\s*clamp\(40px,9vw,52px\)/)
})
