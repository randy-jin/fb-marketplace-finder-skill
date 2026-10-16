---
name: marketplace-finder
description: >-
  Use when the user wants help finding something to buy on Facebook Marketplace:
  searching with criteria, shortlisting good deals, flagging risky listings, or
  watching for new matches.
---
# Marketplace finder

Builds on the Cursor-managed `site-playbooks-facebook-marketplace` skill (search URL, filters, page-parse script, blocked-state rules). Read it first and reuse its Dispatch snippet; this skill adds intake, multi-query search, and judgment. Read only: never message sellers, make offers, save, or share.

## 1. Intake (ask only what's missing, one question at a time)
- What item, must-haves, deal-breakers.
- Budget (max, and what counts as a great price).
- Location: the Marketplace city slug and radius. Slugs are not city names; for an unknown metro, have the browser open facebook.com/marketplace/, set the location, and read the slug from the URL. Remember the user's slug once found.
- Pickup only or shipping OK; condition; how recent (1/7/30 days).

## 2. Preflight
Confirm the box browser has a signed-in personal Facebook session (logged-out sessions usually hit a login wall on page one). If not, follow the `sign-in` skill; suggest a secondary account to limit ban risk. Keep volume low: a few searches per run, no rapid paging.

## 3. Search
- Expand the request into 2-4 query variants (brand/model names, common misspellings, generic term) and run each with the playbook's URL filters (minPrice/maxPrice, daysSinceListed, radius, sortBy=creation_time_descend, condition, category).
- Merge and dedupe by listing id. Drop sold/pending, off-target items, and anything far over budget.
- For the top ~5 candidates, open the item page for description, seller, posted time, condition.

## 4. Judge
For each shortlisted item give: price vs typical used price (quick web check when unsure), condition and completeness, distance, freshness, and red flags (price far below market, stock photos, vague description, new/empty seller profile, asks to ship or pay off-platform, deposit requests).

## 5. Report
Lead with the best pick. Then one line per item: `- [Title](https://www.facebook.com/marketplace/item/<id>/), $price, city, why it's good or what to check`. Suggest 1-2 questions to ask the seller. Mention partial results if a login wall cut the search short.

## 6. Watch mode (optional)
If the user wants alerts, offer a routine that reruns the saved search (sortBy=creation_time_descend, daysSinceListed=1) a few times a day, compares against previously seen listing ids, and only messages when a new match passes the judge step.
