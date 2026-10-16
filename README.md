# Facebook Marketplace Finder skill

An AI-agent skill for finding good deals on Facebook Marketplace: it gathers your criteria, runs several query variants with Marketplace URL filters in a signed-in browser, dedupes results, opens the top listings, judges value and red flags, and returns a ranked shortlist. Optional watch mode re-runs a saved search on a schedule and reports only new matches.

Read only by design: it never messages sellers, makes offers, or saves listings.

See [`marketplace-finder/SKILL.md`](marketplace-finder/SKILL.md).

**Note:** Facebook has no public Marketplace API and its terms restrict automated access. Use low volume with your own account at your own risk.
