# Human-first hiking time evidence — Almaway Guard AI

Research note · 2026-11-08. This is a **data and validation policy**, not a trained AI model or completed route database.

## What this repository contains

- [15 sourced public route-duration seeds](./public_route_duration_seeds.csv): figures transcribed from the Visit Almaty 2024 government-hosted mountain atlas and the Visit Almaty open-data route listings.
- These 15 entries are **published guide estimates**, not 15 measured GPS trips, not individual humans' walking speeds, and **not 15 verified summits**. They are starting points for editorial review only.
- The separate user/team firsthand hiking diaries are not included in this public repository because the required privacy/publication review has not been completed.

## Evidence hierarchy

1. **Measured walking observation**: permissioned GPS/FIT/GPX with timestamps, route variant, moving vs elapsed split, origin/destination, conditions. Clean up GPS jumps, duplicates, time drift and pauses before modeling.
2. **Firsthand manual diary**: clock-time checkpoints and rests. Useful for real elapsed timing, **not** automatic GPS segment moving time.
3. **Source-published guide estimate**: use as a visibly labeled, approximate prior; always check whether duration is one-way, round trip, or point-to-point.
4. **Rule-based model**: constant-speed, Naismith, Tobler. Display as calculated, not observed.
5. **Trained ML correction**: eligible only after sufficient permitted field data and held-out route evaluation demonstrate a useful calibration. If worse than a simple rule, report that.

## Route identity: essential for any comparison

`route_variant_id` must include at least trailhead, endpoint, full geometry, direction, mode of transport/cable car, whether return is included, surface/season and timing scope. Do **not** compare published NTA-220's 7 hours on its named Alpine Rose / Zhusaly-Kezen variant to a different actual hike's total time; that is not model error.

## Proposed record schema

`trip_id,route_variant_id,source_class,source_url,consent_status,hiker_pseudonym,date,time_zone,recording_type,start_time,end_time,elapsed_minutes,moving_minutes,rest_minutes,route_distance_km,elevation_gain_m,weather_summary,snow_presence,gps_quality,notes`

For point records: `trip_id,point_index,time_utc,lat,lon,elevation_m,accuracy_flag,stop_flag`.

Never publish raw GPS containing someone's home/work, name or time-sensitive patterns without appropriate rights; do not assume that removing 200m is always sufficient.

## Scientific benchmark

- Baselines: constant-speed, Naismith's Rule, Tobler's Hiking Function.
- Candidate AI: simple regressor on route geometry and altitude, with features known **before** a hike; a residual correction to a classical baseline is worth testing.
- Unit: **predicted full-route moving time vs measured full-route moving time** on identical verified route variants. Report MAE/RMSE in minutes, optionally percentage error with defined denominators and group sizes.
- Test splits: keep all samples from each full route/recording in one partition; additionally audit same contributors and overlapping geometry. Thousands of pieces from a few hikes are **not** thousands of independent observations.
- No numeric accuracy claims until the experiment exists; allow the ML baseline to lose.
- A published guide figure may be a reasonable planning reference but **must never be used as a GPS-derived ground-truth label**.

## Weather, gear and safety

Weather shown for the actual coordinates/elevation with update time and clear uncertainty. If using Open-Meteo elevation adjustments, do not blindly add a second universal −6.5°C/km correction. A round-trip return before dark requires full outbound+return geometry, predicted time, *separate* rest reserve, twilight and changing terrain conditions. A route/difficulty estimate is **not** a statement of safety. Official closures and high-altitude hazards must remain separate.

## Team action

- **Бекхан**: collect voluntary timestamped tracks with written permission and separate source register.
- **Айсултан**: construct route matching, GPS parser, clean moving/elapsed separation, baseline comparison, and eventually a trained model with meaningful validation.
- **Нурислам**: document provenance and limitations on the English poster; never substitute TBD with attractive, fabricated percentages.

## Primary source material

- Visit Almaty mountain atlas (government-hosted, 2024): https://www.gov.kz/uploads/2024/9/27/997d7056df662c6a94c27686d61b18f4_original.11504216.pdf
- Visit Almaty routes listing: https://nta.visitalmaty.kz/en/trails
- Visit Almaty easy-trails guide: https://nta.visitalmaty.kz/en/guides/hiking-near-almaty-easy-trails

## Scope status

**Done in this commit:** source-linked route reference seed file + research/data quality policy.  
**Not done:** field GPX acquisition, permission review, reliable trail geometries, moving-time extraction, AI training, application integration or live pilot.
