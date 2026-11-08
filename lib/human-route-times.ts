/**
 * Human-first route timing evidence for Almaway Guard AI.
 * Deterministic QA only: this module is NOT a trained AI model.
 */
export type RouteDirection = 'ascent' | 'descent' | 'out-and-back' | 'point-to-point'
export type TimingBasis = 'moving' | 'elapsed' | 'unknown'
export type HumanTimingMethod = 'timestamped-gps' | 'firsthand-reported'
export type HumanReviewState = 'reviewed' | 'pending'

export interface HumanRouteTime {
  id: string
  /** Exact variant with named start/end, NOT just a peak ID. */
  routeVariantId: string
  direction: RouteDirection
  basis: TimingBasis
  method: HumanTimingMethod
  /** A human-observed elapsed/moving duration, in minutes. */
  minutes: number
  contributorPseudonym: string
  consent: 'granted' | 'unknown'
  review: HumanReviewState
  recordedOn?: string
  routeDistanceKm?: number
  /** Internal reference only; do not put raw personal GPX in this repository. */
  evidenceRef?: string
  completeRoute?: boolean
}

export interface PublishedRouteTime {
  id: string
  routeVariantId: string
  routeName: string
  direction: RouteDirection
  /** Unknown when a guide does not explicitly distinguish moving/elapsed. */
  basis: TimingBasis
  minutesLower: number
  minutesUpper: number
  distanceKm?: number
  ascentM?: number
  sourceTitle: string
  sourceUrl: string
  publishedAt?: string
  caveat: string
  /** A published estimate is never a measured individual GPS recording. */
  kind: 'published-guide-estimate'
}

export type TimingReviewFlag =
  | 'missing-route-id'
  | 'invalid-duration'
  | 'missing-contributor'
  | 'consent-not-granted'
  | 'pending-human-review'
  | 'missing-evidence-reference'
  | 'incomplete-gps-route'
  | 'implausible-average-speed'

/** Flag suspicious data for HUMAN inspection. Never auto-correct a duration. */
export function reviewHumanObservation(item: HumanRouteTime): TimingReviewFlag[] {
  const flags: TimingReviewFlag[] = []
  if (!item.routeVariantId?.trim()) flags.push('missing-route-id')
  if (!Number.isFinite(item.minutes) || item.minutes <= 0) flags.push('invalid-duration')
  if (!item.contributorPseudonym?.trim()) flags.push('missing-contributor')
  if (item.consent !== 'granted') flags.push('consent-not-granted')
  if (item.review !== 'reviewed') flags.push('pending-human-review')
  if (!item.evidenceRef?.trim()) flags.push('missing-evidence-reference')
  if (item.method === 'timestamped-gps' && item.completeRoute !== true) flags.push('incomplete-gps-route')
  if (Number.isFinite(item.routeDistanceKm) && item.routeDistanceKm! > 0 && item.minutes > 0) {
    const speedKmh = item.routeDistanceKm! / (item.minutes / 60)
    // Wide QA bounds, not a safety rule. Stops affect elapsed speed.
    if (speedKmh > 12 || speedKmh < 0.3) flags.push('implausible-average-speed')
  }
  return flags
}

export interface HumanTimeSummary {
  routeVariantId: string
  direction: RouteDirection
  basis: Exclude<TimingBasis, 'unknown'>
  /** Count of distinct people, NOT number of GPS segments. */
  independentContributors: number
  /** Descriptive bounds, NOT a statistical confidence interval. */
  observedMinMinutes: number
  observedMedianMinutes: number
  observedMaxMinutes: number
  sufficiency: 'small-sample' | 'descriptive-sample'
  observationIds: string[]
}

function median(sorted: readonly number[]): number {
  const n = sorted.length
  return n % 2 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
}

/** Compare only reviewed, consented trips with identical route variant, direction and time basis. */
export function summarizeHumanTimes(
  observations: readonly HumanRouteTime[],
  routeVariantId: string,
  direction: RouteDirection,
  basis: Exclude<TimingBasis, 'unknown'>,
): HumanTimeSummary | null {
  const valid = observations.filter(x =>
    x.routeVariantId === routeVariantId && x.direction === direction && x.basis === basis &&
    reviewHumanObservation(x).length === 0,
  )
  if (!valid.length) return null
  // Multiple hikes by one person do not inflate the independent-participant count.
  const byContributor = new Map<string, HumanRouteTime>()
  for (const observation of valid) {
    const existing = byContributor.get(observation.contributorPseudonym)
    if (!existing || (observation.recordedOn ?? '') > (existing.recordedOn ?? '')) {
      byContributor.set(observation.contributorPseudonym, observation)
    }
  }
  const chosen = [...byContributor.values()]
  const values = chosen.map(x => x.minutes).sort((a, b) => a - b)
  return {
    routeVariantId, direction, basis,
    independentContributors: chosen.length,
    observedMinMinutes: values[0],
    observedMedianMinutes: median(values),
    observedMaxMinutes: values[values.length - 1],
    sufficiency: chosen.length >= 3 ? 'descriptive-sample' : 'small-sample',
    observationIds: chosen.map(x => x.id),
  }
}

export type TimeEvidence =
  | { kind: 'human-observed-summary'; summary: HumanTimeSummary; label: 'Observed human times, descriptive range' }
  | { kind: 'human-sparse'; summary: HumanTimeSummary; label: 'Few human observations: not a reliable typical time' }
  | { kind: 'published-reference'; reference: PublishedRouteTime; label: 'Published guide estimate, not GPS measured' }
  | { kind: 'no-evidence'; label: 'No verified comparable time available' }

/** Published unknown-basis time cannot silently masquerade as moving-time data. */
export function chooseTimeEvidence(
  observations: readonly HumanRouteTime[],
  published: readonly PublishedRouteTime[],
  routeVariantId: string,
  direction: RouteDirection,
  basis: TimingBasis,
): TimeEvidence {
  if (basis !== 'unknown') {
    const summary = summarizeHumanTimes(observations, routeVariantId, direction, basis)
    if (summary) return summary.sufficiency === 'descriptive-sample'
      ? { kind: 'human-observed-summary', summary, label: 'Observed human times, descriptive range' }
      : { kind: 'human-sparse', summary, label: 'Few human observations: not a reliable typical time' }
  }
  const guide = published.find(x =>
    x.routeVariantId === routeVariantId && x.direction === direction && x.basis === basis)
  if (guide) return { kind: 'published-reference', reference: guide, label: 'Published guide estimate, not GPS measured' }
  return { kind: 'no-evidence', label: 'No verified comparable time available' }
}
