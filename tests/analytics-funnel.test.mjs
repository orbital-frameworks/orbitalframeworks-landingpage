import test from 'node:test'
import assert from 'node:assert/strict'

test('Funnel Analytics unit contracts and PII sanitization', async (t) => {
  // Setup synthetic DOM and storage environment for unit test
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  }

  const dataLayer = []
  globalThis.window = {
    dataLayer,
    location: {
      href: 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom&email=leak%40empresa.pe',
      pathname: '/blog/software-a-medida-o-saas-como-decidir/',
      origin: 'https://orbitalframeworks.qzz.io',
    },
  }
  globalThis.document = {
    title: 'Software a medida o SaaS: cómo decidir | Orbital Insights',
    referrer: 'https://www.linkedin.com/feed/?user_token=secret_123',
    querySelector: () => null,
    head: { append: () => {} },
    removeEventListener: () => {},
    addEventListener: () => {},
  }

  // Dynamic import of analytics module
  const analytics = await import('../src/analytics.ts')

  await t.test('1. Unconsented state blocks all event emission', () => {
    storage.clear()
    dataLayer.length = 0
    assert.equal(analytics.isConsentGranted(), false)
    analytics.trackPageView()
    analytics.trackContactIntent('email')
    analytics.trackArticleIntent('article_to_service', '/servicios/desarrollo-software-medida/')
    analytics.trackServiceIntent('service_to_contact', 'mailto')
    assert.equal(dataLayer.length, 0, 'No event must be pushed to dataLayer without explicit consent')
  })

  await t.test('2. Granted consent enables sanitized page_view with UTMs and no PII', () => {
    storage.set('orbital-analytics-consent', 'granted')
    assert.equal(analytics.isConsentGranted(), true)
    dataLayer.length = 0

    analytics.trackPageView('/blog/software-a-medida-o-saas-como-decidir/')
    assert.equal(dataLayer.length, 1, 'Exactly 1 page_view event pushed')
    const pvArgs = Array.from(dataLayer[0])
    assert.equal(pvArgs[0], 'event')
    assert.equal(pvArgs[1], 'page_view')

    const params = pvArgs[2]
    assert.equal(params.page_path, '/blog/software-a-medida-o-saas-como-decidir/')
    assert.ok(params.page_location.includes('utm_source=linkedin'), 'Preserves utm_source')
    assert.ok(params.page_location.includes('utm_medium=organic_social'), 'Preserves utm_medium')
    assert.ok(params.page_location.includes('utm_campaign=pilot_saas_vs_custom'), 'Preserves utm_campaign')
    assert.ok(!params.page_location.includes('leak@empresa.pe') && !params.page_location.includes('email='), 'Strips PII parameter from location')
    assert.ok(!params.page_referrer.includes('secret_123') && !params.page_referrer.includes('user_token'), 'Strips PII parameter from referrer')
  })

  await t.test('3. Funnel step recording and session journey attribution', () => {
    dataLayer.length = 0
    const journey = analytics.getSessionJourney()
    assert.equal(journey.entryArticle, 'software-a-medida-o-saas-como-decidir', 'Entry article recorded from page_view')

    // Simulate clicking from article to service
    analytics.trackArticleIntent('article_to_service', '/servicios/desarrollo-software-medida/', 'software-a-medida-o-saas-como-decidir')
    assert.equal(dataLayer.length, 1)
    const artArgs = Array.from(dataLayer[0])
    assert.equal(artArgs[1], 'article_intent')
    assert.equal(artArgs[2].intent_type, 'article_to_service')
    assert.equal(artArgs[2].target, '/servicios/desarrollo-software-medida/')
    assert.equal(artArgs[2].article_slug, 'software-a-medida-o-saas-como-decidir')

    // Simulate arriving on service page
    analytics.trackPageView('/servicios/desarrollo-software-medida/')
    const updatedJourney = analytics.getSessionJourney()
    assert.equal(updatedJourney.visitedService, 'desarrollo-software-medida')

    // Trigger contact from service page
    dataLayer.length = 0
    analytics.trackServiceIntent('service_to_contact', 'mailto', 'desarrollo-software-medida')
    assert.equal(dataLayer.length, 1)
    const srvArgs = Array.from(dataLayer[0])
    assert.equal(srvArgs[1], 'service_intent')
    assert.equal(srvArgs[2].intent_type, 'service_to_contact')
    assert.equal(srvArgs[2].service_slug, 'desarrollo-software-medida')
    assert.equal(srvArgs[2].from_article, 'software-a-medida-o-saas-como-decidir', 'Attributes service intent back to originating article')

    // Track contact intent
    dataLayer.length = 0
    analytics.trackContactIntent('email', {
      source_page: '/servicios/desarrollo-software-medida/',
      service_slug: 'desarrollo-software-medida',
    })
    assert.equal(dataLayer.length, 1)
    const contactArgs = Array.from(dataLayer[0])
    assert.equal(contactArgs[1], 'contact_intent')
    assert.equal(contactArgs[2].method, 'email')
    assert.equal(contactArgs[2].contact_channel, 'mailto')
    assert.equal(contactArgs[2].source_path, '/servicios/desarrollo-software-medida/')
    assert.equal(contactArgs[2].service_context, 'desarrollo-software-medida')
    assert.equal(contactArgs[2].funnel_origin, 'software-a-medida-o-saas-como-decidir')
  })

  await t.test('4. Deduplication prevents rapid double-firing', () => {
    dataLayer.length = 0
    analytics.trackContactIntent('gmail', { source_page: '/blog/software-a-medida-o-saas-como-decidir/' })
    assert.equal(dataLayer.length, 1)

    // Immediate duplicate invocation (e.g. from both inline and bubbling handlers)
    analytics.trackContactIntent('gmail', { source_page: '/blog/software-a-medida-o-saas-como-decidir/' })
    assert.equal(dataLayer.length, 1, 'Duplicate event must be discarded by cooldown filter')
  })

  await t.test('5. Zero generate_lead emissions across all interactions', () => {
    for (const item of dataLayer) {
      const eventName = Array.from(item)[1]
      assert.notEqual(eventName, 'generate_lead', 'Must NEVER emit generate_lead without confirmed backend conversion')
    }
  })
})
