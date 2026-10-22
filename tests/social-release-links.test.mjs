import test from 'node:test'
import assert from 'node:assert/strict'
import { outboundLinkTargets } from '../scripts/social-release-publisher.mjs'

test('LinkedIn safety/go wrapper and shortlink do not hide the approved destination',()=>{
  const short='https://lnkd.in/dNfcPkrS'
  const approved='https://orbitalframeworks.qzz.io/blog/test/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_test'
  const links=outboundLinkTargets([
    {href:'https://www.linkedin.com/safety/go/?url='+encodeURIComponent(short)+'&urlhash=abc',text:short},
    {href:approved,text:'Ver artículo'}
  ])
  assert.ok(links.includes(short))
  assert.ok(links.includes(approved))
  assert.ok(!links.includes('https://www.linkedin.com/safety/go/?url='+encodeURIComponent(short)+'&urlhash=abc'))
})
