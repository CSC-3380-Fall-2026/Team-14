import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
after(async () => { await vite.close() })
const { default: MapPage } = await vite.ssrLoadModule('/src/components/MapPage.tsx')

test('a checkout without keys enables destination search while the map loads', () => {
  const html = renderToStaticMarkup(createElement(MapPage, { destination: null, onDestinationChange: () => {} }))
  const input = html.match(/<input[^>]*id="destination-search-query"[^>]*>/)?.[0]
  assert.ok(input)
  assert.doesNotMatch(input, /disabled/)
  assert.match(html, /Loading the map/)
  assert.match(html, /OpenStreetMap/)
})

test('the named destination and trip action remain available without keys', () => {
  const html = renderToStaticMarkup(createElement(MapPage, {
    destination: { latitude: 29.97599, longitude: -90.07012, label: 'New Orleans' }, onDestinationChange: () => {},
  }))
  assert.match(html, /Selected destination: New Orleans/)
  assert.match(html, /Plan a trip here/)
})
