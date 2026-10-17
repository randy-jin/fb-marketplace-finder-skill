async (page) => {
  // Paste this entire function into a Playwright code tool. No page mutation.
  const html = await page.content();

  // Read balanced JSON, respecting braces inside strings and escaped quotes.
  const readObject = (start) => {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < html.length; i++) {
      const c = html[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === '"') inString = false;
      } else if (c === '"') inString = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        try { return JSON.parse(html.slice(start, i + 1)); }
        catch { return null; }
      }
    }
    return null;
  };

  const objectsFor = (key) => {
    const pattern = new RegExp('"' + key + '"\\s*:\\s*(\\{)', 'g');
    const found = [];
    for (const match of html.matchAll(pattern)) {
      const value = readObject(match.index + match[0].length - 1);
      if (value) found.push({ index: match.index, value });
    }
    return found;
  };

  const feeds = objectsFor('marketplace_search').filter(
    ({ value }) => Array.isArray(value.feed_units?.edges)
  );
  // Repeated payloads can include an empty placeholder before actual results.
  const selected = feeds.find(({ value }) => value.feed_units.edges.length) ?? feeds[0];
  const feed = selected?.value.feed_units;

  const params = objectsFor('params').filter(
    ({ value }) => typeof value.location_id === 'string' || typeof value.location_id === 'number'
  );
  // Prefer the closest preceding echo; otherwise use the closest following echo.
  const preceding = selected ? params.filter(({ index }) => index < selected.index) : [];
  const echo = selected
    ? preceding[preceding.length - 1] ?? params.find(({ index }) => index > selected.index)
    : undefined;

  const stripTracking = (value) => {
    if (Array.isArray(value)) return value.map(stripTracking);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value)
        .filter(([key]) => key !== 'tracking')
        .map(([key, child]) => [key, stripTracking(child)]));
    }
    return value;
  };
  const edges = feed ? stripTracking(feed.edges) : null;
  const listings = [];
  const seen = new Set();
  for (const edge of edges ?? []) {
    const listing = edge?.node?.listing;
    if (!listing || listing.id == null) continue; // Ads/non-listing units.
    const id = String(listing.id);
    if (!/^\d+$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    const place = listing.location?.reverse_geocode;
    listings.push({
      id,
      title: listing.marketplace_listing_title ?? null,
      price: listing.listing_price?.formatted_amount ?? null,
      city: place?.city ?? null,
      state: place?.state ?? null,
      photo: listing.primary_listing_photo?.image?.uri ?? null,
      delivery_types: Array.isArray(listing.delivery_types) ? listing.delivery_types : null,
      is_sold: typeof listing.is_sold === 'boolean' ? listing.is_sold : null,
      is_pending: typeof listing.is_pending === 'boolean' ? listing.is_pending : null,
      url: `https://www.facebook.com/marketplace/item/${id}/`
    });
  }
  return {
    edges,
    page_info: feed?.page_info ?? null,
    location_id: echo ? String(echo.value.location_id) : null,
    listings
  };
}
