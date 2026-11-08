import test from 'node:test'
import assert from 'node:assert/strict'
import { reviewHumanObservation, summarizeHumanTimes, chooseTimeEvidence } from '../lib/human-route-times.ts'
import { publishedRouteTimeReferences } from '../lib/route-time-references.ts'

const routeId = 'atlas-108-medeu-lesnoy-pass-bukreev'
const person = (id, minutes, extra = {}) => ({
  id, routeVariantId: routeId, direction: 'out-and-back',
  basis: 'elapsed', method: 'firsthand-reported', minutes,
  contributorPseudonym: id, consent: 'granted', review: 'reviewed',
  evidenceRef: `private-review:${id}`, completeRoute: true, ...extra,
})

test('official estimates are not classified as measured human GPS observations', () => {
  assert.equal(publishedRouteTimeReferences.length, 4)
  assert.ok(publishedRouteTimeReferences.every(x => x.kind === 'published-guide-estimate'))
  const guide = chooseTimeEvidence([], publishedRouteTimeReferences, routeId, 'out-and-back', 'unknown')
  assert.equal(guide.kind, 'published-reference')
  assert.equal(guide.reference.minutesLower, 390)
})

test('unknown-basis atlas estimate never becomes a measured moving-time prediction', () => {
  assert.equal(chooseTimeEvidence([], publishedRouteTimeReferences, routeId, 'out-and-back', 'moving').kind, 'no-evidence')
})

test('one person's report is not a reliable typical hiking time', () => {
  const x = chooseTimeEvidence([person('a', 405)], publishedRouteTimeReferences, routeId, 'out-and-back', 'elapsed')
  assert.equal(x.kind, 'human-sparse')
  assert.equal(x.summary.independentContributors, 1)
})

test('only same exact route, direction and timing basis contribute to the human median', () => {
  const rows = [person('a', 385), person('b', 415), person('c', 405),
    person('other-route', 1, { routeVariantId: 'elsewhere' }),
    person('other-direction', 1, { direction: 'ascent' }),
    person('other-basis', 1, { basis: 'moving' })]
  const x = summarizeHumanTimes(rows, routeId, 'out-and-back', 'elapsed')
  assert.equal(x.independentContributors, 3)
  assert.equal(x.observedMedianMinutes, 405)
  assert.equal(x.observedMinMinutes, 385)
  assert.equal(x.observedMaxMinutes, 415)
  assert.equal(x.sufficiency, 'descriptive-sample')
})

test('same contributor on repeated hikes counts as one independent person', () => {
  const rows = [person('a-old', 430, { contributorPseudonym: 'a', recordedOn: '2026-08-01' }),
    person('a-new', 420, { contributorPseudonym: 'a', recordedOn: '2026-09-01' }),
    person('b', 390)]
  const x = summarizeHumanTimes(rows, routeId, 'out-and-back', 'elapsed')
  assert.equal(x.independentContributors, 2)
  assert.equal(x.observedMedianMinutes, 405)
  assert.ok(x.observationIds.includes('a-new'))
})

test('unconsented and unreviewed human timings are excluded', () => {
  const rows = [person('a', 390, { consent: 'unknown' }), person('b', 400, { review: 'pending' })]
  assert.ok(reviewHumanObservation(rows[0]).includes('consent-not-granted'))
  assert.equal(summarizeHumanTimes(rows, routeId, 'out-and-back', 'elapsed'), null)
})

test('incomplete GPS cannot be passed off as the whole route', () => {
  const x = person('a', 85, { method: 'timestamped-gps', completeRoute: false, basis: 'moving' })
  assert.ok(reviewHumanObservation(x).includes('incomplete-gps-route'))
  assert.equal(summarizeHumanTimes([x], routeId, 'out-and-back', 'moving'), null)
})

test('implausible average speed flags human review without rewriting source minutes', () => {
  const x = person('fast', 12, { routeDistanceKm: 18 })
  assert.ok(reviewHumanObservation(x).includes('implausible-average-speed'))
  assert.equal(x.minutes, 12)
})

test('unknown route has no time, never invented AI output', () => {
  assert.equal(chooseTimeEvidence([], publishedRouteTimeReferences, 'no-source-available', 'ascent', 'unknown').kind, 'no-evidence')
})
