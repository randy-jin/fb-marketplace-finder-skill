# Marketplace city slugs

A slug is Facebook's location route identifier, not a city name you can freely substitute. Use it in `https://www.facebook.com/marketplace/<slug>/search/?query=...`.

| Location | Known-good slug |
| --- | --- |
| New York City | `nyc` |
| Los Angeles | `la` |
| San Francisco | `sanfrancisco` |
| Chicago | `chicago` |
| Austin | `austin` |
| Boston | `boston` |
| Seattle | `seattle` |
| Atlanta | `atlanta` |
| Miami | `miami` |
| Portland | `portland` |
| Calgary | `calgary` |

The US slugs come from earlier testing in the reference research; Calgary was verified working in October 2026. These observations are not a permanent guarantee. Verify the location displayed by Facebook for your session.

## Find your own

1. Open `https://www.facebook.com/marketplace/` in your signed-in automation browser.
2. Open the location picker, select your city and radius, and apply.
3. Read the segment following `/marketplace/` in the resulting location-specific URL. If no location-specific route appears, use the picker-generated search and inspect its location/`params` echo rather than guessing a slug.
4. Try one search with that route. Confirm the displayed location and echoed `location_id` against the selected place. The echo can use an internal ID instead of the route text.

**Failure tell:** a redirect (often HTTP 302) to `/marketplace/category/search/` drops the requested location and may fall back to the browser's IP location. Do not treat those results as local matches. Return to the picker.

Earlier tests rejected `newyork`, `losangeles`, `bayarea`, `sf`, `san-francisco`, `new-york`, ZIP codes, and numeric IDs in the city-slug position. Do not construct routes from those guesses. An internal numeric `location_id` in the HTML is a different thing from a usable URL slug.
