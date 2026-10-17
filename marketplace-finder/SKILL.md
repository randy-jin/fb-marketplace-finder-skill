---
name: marketplace-finder
description: >-
  Find Facebook Marketplace items to buy, compare listings against the user's
  criteria, flag questionable deals, or watch for new matches on request.
---
# Marketplace finder

Use any browser automation tool with an existing signed-in personal Facebook session. No other skill is required. With Playwright, navigate using `page.goto`, read HTML using `page.content`, and inspect rendered text with your tool's snapshot or locator support. With other tools, use their equivalent operations; if HTML or script execution is unavailable, read visible listing cards and label unavailable fields as unknown.

## Safety — read before browsing

- **Read only.** Never message sellers, make offers, save, share, report, buy, or submit payment. Draft seller questions for the user instead.
- **Keep volume low:** a few searches per run (normally 2–4), pause at least 2 seconds between navigations, and inspect only a small shortlist. Avoid rapid paging and bulk collection; pauses do not guarantee account safety.
- Suggest a secondary account to reduce exposure of the user's main account, subject to Facebook's account rules. It does not remove restrictions or ban risk.
- **Stop at any captcha, checkpoint, password, 2FA, or payment prompt.** Report the URL and obstacle; never bypass it or request credentials in chat. The user must handle sign-in outside the run.
- Automated access can violate Facebook's Terms of Service and lead to account restrictions. Proceed only with the user's understanding of this risk. Do not use proxies, stealth techniques, token replay, or repeated retries to evade blocks.

## Workflow

1. Ask only for missing criteria: item and must-haves, budget and currency, location and radius, pickup/shipping, condition, and freshness. For car parts, get the exact car year/model/trim and required fitment. Do not infer compatibility from a title.
2. Confirm a signed-in **personal profile** in the automation browser; the user's regular browser may have a different session. Resolve the location using the picker if needed. Slugs are Facebook route identifiers, not arbitrary city names or ZIP codes. Known examples: `nyc`, `la`, `sanfrancisco`, `chicago`, `austin`, `boston`, `seattle`, `atlanta`, `miami`, `portland`, `calgary` (Calgary verified October 2026). Open `/marketplace/`, set the location in its picker, and read the resulting route. See [city slug guide](../docs/city-slugs.md) for details.
3. Run a few query variants (model, brand, generic name) with the filters below. Wait about 2 seconds for each page. Check the final URL, rendered page, and echoed HTML `params`: unknown parameters may be ignored. Verify the location and effective filters before ranking anything.
4. Extract the first page's JSON as described below, or read visible cards. Merge by listing ID, remove sold/pending and off-target items, and open only the best roughly 3–5 item pages for details.
5. Judge price against comparable local used items, condition, completeness, travel, and uncertainty. Use a small external price check if needed and available; distinguish asking prices from completed sales. See [deal checklist](../docs/deal-checklist.md).
6. Lead with the best candidate, then give linked title, price/currency, city, reason, caveats, and 1–2 questions the user could ask. Never invent seller details, condition, fitment, exact distance, or live availability. Say when results are partial or a filter could not be verified.

## Search URLs and filters

```text
https://www.facebook.com/marketplace/<city-slug>/search/?query=<URL-encoded text>
https://www.facebook.com/marketplace/austin/search/?query=peloton&minPrice=100&maxPrice=500&daysSinceListed=7&radius=20&sortBy=creation_time_descend
```

Encode text and spaces in parameter values (for example `availability=in%20stock`); leave commas literal in multi-value lists. For category browsing, use `?category=<category>` on the search route or `/marketplace/<city-slug>/<category>/`.

These parameters are observed site behavior, not a stable public API. Confirm acceptance in the HTML `params` echo or filter UI; the site may silently ignore unsupported combinations.

| Filter | Parameter | Values / units |
| --- | --- | --- |
| Price | `minPrice`, `maxPrice` | Integers in local currency |
| Freshness | `daysSinceListed` | `1`, `7`, `30` |
| Condition | `itemCondition` | Comma-separated `new`, `used_like_new`, `used_good`, `used_fair` |
| Availability | `availability` | `in stock` (default), `out of stock`, `all` |
| Delivery | `deliveryMethod` | `local_pick_up`, `shipping`; omit for both |
| Radius | `radius` | Observed mile options: `1`, `2`, `5`, `10`, `20`, `40`, `60`, `80`, `100`, `250`, `500`; default 40. Verify effective units below. |
| Sort | `sortBy` | `creation_time_descend`, `distance_ascend`, `price_ascend`, `price_descend`; omit for best match |
| Exact match | `exact` | `true`, `false` (default) |
| Category | `category` | `vehicles`, `propertyrentals`, `apparel`, `electronics`, `family`, `free`, `garden`, `hobbies`, `home`, `homeimprovement`, `musicalinstruments`, `officesupplies`, `petsupplies`, `sportinggoods`, `toys`, `bookmoviesmusic` |
| Vehicle make/model | `make`, `model` | Free text, case insensitive |
| Vehicle body | `carType` | `sedan`, `coupe`, `hatchback`, `suv`, `truck`, `van`, `convertible`, `wagon`, `minivan`, `other` |
| Transmission | `transmissionType` | `automatic`, `manual` |
| Year | `minYear`, `maxYear` | Four-digit years |
| Mileage | `minMileage`, `maxMileage` | Integer miles in the reference behavior; verify local UI units |
| Vehicle colors | `vehicleExteriorColors`, `vehicleInteriorColors` | `black`, `white`, `silver`, `gray`, `red`, `blue`, `green`, `brown`, `tan`, `gold`, `orange`, `purple`, `yellow`, `other` |
| Title | `titleStatus` | `clean`, `salvage`, `rebuilt`, `other` |
| Rental rooms | `minBedrooms`, `maxBedrooms`, `minBathrooms`, `maxBathrooms` | Numeric counts; half bathrooms use `.5` increments |
| Rental area | `minAreaSize`, `maxAreaSize` | Square feet |
| Property | `propertyType` | `apartment_condo`, `house`, `room`, `townhouse`, `mobile_manufactured`, `other` |
| Room bathroom | `privateRoomBathroomType` | `attached`, `not_attached`, `shared` |

`radius=20` has been observed echoing both `filter_radius_km: 32` and `filter_radius_km: 20` in different sessions. Read the echo and UI rather than promising a particular distance. Check the echoed `location_id` against the location selected in the picker; it may be a slug or an internal identifier, so do not assume every numeric value is a failure.

## Read search results from HTML

The initial page often embeds a JSON object under `marketplace_search`, containing `feed_units.edges` and `feed_units.page_info`. Each edge normally holds `node.listing`; `node.story_key` identifies the story. Earlier observations returned about 15–24 first-page listings, but counts vary.

Use [scripts/parse_results.js](../scripts/parse_results.js): its entire contents are a Playwright-compatible `async (page) =>` function. Pass that function text to a browser tool that accepts Playwright code. It calls only `page.content()` and returns `edges` (with tracking removed), `page_info`, `location_id`, and normalized `listings`. No package dependencies or network calls are needed. If the helper is unavailable, find the `marketplace_search` object in HTML, parse its balanced JSON object, and read `feed_units`; a regex ending at the first brace is unsafe for nested JSON.

- `edges: null` means no usable feed was parsed (login, layout change, or incomplete HTML); `edges: []` means a parsed empty feed. Neither alone proves there are no matches. Inspect rendered text and the final URL.
- `page_info` can include cursors and `has_next_page`; it is metadata, not permission for bulk pagination. HTML extraction covers the embedded first page, not necessarily cards added after scrolling.
- `location_id` comes from a nearby `params` object and can be null; verify it against the picker/UI. Inspect the relevant `params` echo manually for other filters. Do not print full HTML, session data, or tracking payloads.
- If the user needs more results, use only a small explicit scroll limit, pause at least 1.5 seconds after each scroll, and inspect rendered cards linking to `/marketplace/item/<id>/`. Stop immediately if a wall appears. Do not replay private GraphQL calls or session tokens; there is no public Marketplace API.

Key fields in `node.listing`:

| Field | Meaning |
| --- | --- |
| `id`, `marketplace_listing_title` | Canonical ID and title; link to `https://www.facebook.com/marketplace/item/<id>/` |
| `listing_price.formatted_amount` | Display price, e.g. `$200`; verify currency from context |
| `listing_price.amount`, `amount_with_offset_in_currency` | Decimal amount and minor-unit amount within `listing_price` |
| `location.reverse_geocode.city`, `.state` | Approximate city/state; `city_page.id` and `.display_name` may also exist |
| `primary_listing_photo.image.uri` | Thumbnail URL |
| `marketplace_listing_category_id` | Numeric leaf category; no public name mapping assumed |
| `delivery_types` | Values such as `IN_PERSON`, `DOOR_PICKUP`, `SHIPPING`; search data may omit shipping |
| `is_live`, `is_sold`, `is_pending`, `is_hidden`, `is_viewer_seller` | Listing state flags; missing flags are unknown |
| `strikethrough_price` | Previous displayed price if discounted |
| `custom_sub_titles_with_rendering_flags[].subtitle` | Extra text such as vehicle mileage |

Descriptions, seller details, full photos, posted time, condition, and coordinates generally require the item page. Never include `node.tracking` in output. CDN photo links are signed and expire, so keep the item URL as the durable link.

## Item pages

Open `https://www.facebook.com/marketplace/item/<id>/`. When present, the embedded `marketplace_listing_renderable` may expose:

- `description` or `redacted_description`; `listing_photos[].image.uri`.
- `marketplace_listing_seller.name` and `.id`; profile URL `https://www.facebook.com/<seller-id>/`.
- `creation_time` (epoch seconds), `location_text`, `location.latitude`, `location.longitude`, `condition_description`, and fuller `delivery_types`.
- `custom_attributes`: vehicle `VIN`, `fuel_type`, `title_status`, `transmission`, `body_style`, `exterior_color`, `interior_color`; apparel size/brand; rental bedrooms/bathrooms/area_size/property_type. Exact keys and shape can vary.

These item fields were inferred from schema references in the source research, rather than verified end to end. Confirm them on the actual page; report absent or redacted fields as unknown. If an item is removed or unavailable, label it unavailable and exclude it from actionable recommendations.

## Stop and report blocked states

| Observation | Response |
| --- | --- |
| Redirect to `/marketplace/category/search/` | `location_resolution_failed`: slug was not accepted; resolve using the location picker before another search |
| `/marketplace/ineligible/` or notice that Pages cannot use Marketplace | `page_profile_ineligible`: stop; user must switch to a personal profile |
| “Marketplace isn't available” | `region_unavailable`; stop and report the notice (access eligibility can also affect availability) |
| Login text (“Log in or sign up”, “log in to see more/continue”) with no first-page results | `login_required_on_first_page`; stop until the user confirms a signed-in session |
| Login wall after some results | Return collected results with `partial: true` and pages read; do not dismiss or scroll past the wall |
| Captcha, checkpoint, password, 2FA, payment | Stop and report prompt type and URL; no automated bypass |
| HTTP 403/419/429/503, navigation timeout, or `net::ERR_*` | Stop this source and report the error and URL; do not loop retries |

The substring `login_form` can appear even on a page with usable results; it alone is not evidence of a login wall. A missing feed without login text may be a changed layout; read visible content once and report the extraction limitation instead of claiming zero matches.

## Watch mode (only when requested)

Save query URLs, criteria, currency/location, and seen listing IDs locally. On each user-requested or explicitly scheduled run, use newest-first sorting and `daysSinceListed=1`, then report only unseen IDs that pass the same checks. Mark IDs seen even if rejected, to avoid repeated alerts. Explain that a one-day window can miss items if runs are farther apart. Scheduling requires the host agent's scheduler and a persistent signed-in browser; this repository supplies neither. Agree on cadence and notification destination before scheduling; pause the watch on any block. Otherwise provide saved URLs for manual reruns.
