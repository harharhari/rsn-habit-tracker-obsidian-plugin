# Response to Community CSS review

Observation: styles.css lines 59–63 used :has; the review warned about broad selector invalidation and performance.

Resolution in 1.1.8: remove all :has selectors from the distributed stylesheet. Direct exact-path selectors hide each matching title. For the three folders, a following-sibling selector also hides their child list. This keeps maintenance files out of the explorer while preserving Details access and data paths. No DOM observer or polling was introduced.

Validation: npm run check now rejects styles.css if a relational :has( selector returns. Browser scenarios exercise expanded children with inline display:block, dynamic insertion, path changes, unrelated same-name folders, outside-explorer elements, zero-height hidden rows and stylesheet-removal restoration. These use representative explorer markup; native app/theme testing remains required.

Upload the new source and 1.1.8 manifest. Run all three OS CI jobs, tag the passing commit 1.1.8, build the attested draft, test its downloads, publish it and return to the existing Community entry. Do not overwrite the published 1.1.7 tag or open a duplicate plugin submission. Local checks do not claim hosted acceptance.
