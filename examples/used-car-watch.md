# Worked example: watching for a used car

**Fictional walkthrough; no scheduler or alerts are created by this example.**

Request: “Watch for a 2016–2018 Toyota Corolla automatic under USD 12,000 around Seattle, clean title, up to 100,000 miles.”

1. Confirm radius, currency, mileage units, inspection requirements, and exclusions. Ask the user to choose cadence and notification destination before enabling any host-provided schedule. Explain that each run needs an accessible signed-in browser; otherwise supply a saved URL for manual reruns.
2. Save this search and verify its filters/location in the UI and HTML echo:

```text
https://www.facebook.com/marketplace/seattle/search/?query=Toyota%20Corolla&category=vehicles&make=Toyota&model=Corolla&minYear=2016&maxYear=2018&maxPrice=12000&maxMileage=100000&transmissionType=automatic&titleStatus=clean&radius=40&sortBy=creation_time_descend&daysSinceListed=1
```

3. For an agreed once-daily run, read the first page, deduplicate IDs, and compare against local watch state: query URL, criteria, last run, and seen IDs. Inspect only a few unseen candidates and pause between pages. Do not automate seller contact or use Facebook's Save control.
4. Fictional first run: two unseen IDs; reject one for a conflicting title claim. Report the other as “USD 10,800, claimed 84,000 miles and clean title; potentially within budget, but VIN, lien/title history, maintenance, and an independent inspection remain unverified.” Mark both IDs seen.
5. Fictional second run: only previously seen IDs, so no new-match alert. If an unseen listing passes, send a report only through the user's explicitly authorized destination. On captcha/checkpoint or login wall, pause the watch and report the block.

The freshness filter is a rolling one-day window: missed runs can miss listings. A clean-title filter is a seller claim, not proof. Never treat a low price or profile appearance as a substitute for inspection. See [deal checklist](../docs/deal-checklist.md).
