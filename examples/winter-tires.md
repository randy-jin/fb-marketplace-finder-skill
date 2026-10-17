# Worked example: winter tires and rims

**Fictional walkthrough; no live listings or verified fitment.**

Request: “Find winter tires on rims for my 2018 Honda Civic LX sedan in Calgary, under CAD 700, pickup only.”

1. Confirm the exact vehicle/trim, approved tire sizes and wheel fitment from the owner's documentation, desired tread/age limits, and travel radius. Treat any proposed size as unverified until checked against that car.
2. Confirm the signed-in browser and `calgary` location. Try two searches, with at least 2 seconds between navigations:

```text
https://www.facebook.com/marketplace/calgary/search/?query=Honda%20Civic%20winter%20tires%20rims&maxPrice=700&deliveryMethod=local_pick_up&radius=20&sortBy=creation_time_descend
https://www.facebook.com/marketplace/calgary/search/?query=Civic%20winter%20wheels&maxPrice=700&deliveryMethod=local_pick_up&radius=20&daysSinceListed=7
```

3. Check the location/filter echo and radius units. Parse the first pages, deduplicate IDs, and exclude sold/pending listings. Open only a few promising sets. Compare size, bolt pattern, offset, hub bore, brake clearance, TPMS, tread depth, date codes, and included hardware.
4. Fictional result: “Set A, CAD 550, Calgary: strongest candidate because four tires and rims are pictured and measurements are provided; fitment and date codes still unverified. Set B, CAD 400: lower price, but uneven wear and unspecified wheel dimensions make it a weaker choice.” Do not present either as safe to install.
5. Draft questions for the user: “Can you provide the wheel markings and all four tire date codes?” “What are the measured tread depths, and have any tires been repaired?” Never send them automatically.

Report missing fitment evidence and transport cost before calling a set a bargain. See [deal checklist](../docs/deal-checklist.md).
