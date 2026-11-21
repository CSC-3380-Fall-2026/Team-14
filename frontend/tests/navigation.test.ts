import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePage } from '../src/navigation.ts'

// Catches a resolver that stops accepting the landing page's hash forms.
for (const hash of ['', '#', '#/']) {
  test(`opens home for ${JSON.stringify(hash)}`, () => {
    assert.equal(resolvePage(hash), 'home')
  })
}

// Catches a resolver that cannot open the login view from a direct URL.
test('opens login for its direct hash URL', () => {
  assert.equal(resolvePage('#/login'), 'login')
})

// Catches unknown hashes accidentally selecting login or an unavailable view.
for (const hash of ['#/unknown', '#/login-extra', '#/login/profile']) {
  test(`falls back to home for unknown hash ${hash}`, () => {
    assert.equal(resolvePage(hash), 'home')
  })
}

// The merged trip form must be reachable from a direct link.
test('opens trip preferences for its direct hash URL', () => {
  assert.equal(resolvePage('#/preferences'), 'preferences')
})

// Older map links should land on the map now shown on the homepage.
test('keeps existing map links on the home view', () => {
  assert.equal(resolvePage('#/map'), 'home')
})

for (const page of ['signup', 'trips', 'itinerary', 'review', 'flights'] as const) {
  test(`opens ${page} from its direct link`, () => {
    assert.equal(resolvePage(`#/${page}`), page)
  })
}
