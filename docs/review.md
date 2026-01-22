Glaring risks to keep an eye on (not nits)
A) cms-api-structure.md wording is slightly misleading now

It says “public site calls the CMS over HTTP.” That’s true during build/export (and possibly preview), but not true for your public static requirement.

Not a blocker, but it will confuse a future “fresh chat + repo” validation pass. I’d tweak one paragraph to say:

site calls CMS at build time (and in preview mode), not during public viewing.

B) MembershipPlans is read: () => true

This is probably fine (it’s just two plans and prices), and you’re not relying on runtime reads anyway. Just be aware:

it enables public scraping of plan prices via CMS API

if you later add internal-only plans/pricing experiments, you’ll want a more nuanced access policy

Not a current blocker, just a future footgun.

C) Build-time CMS dependency still exists

You’ve done the right thing for static-first, but it means:

your export pipeline must always have a reachable CMS (and correct CMS_URL, auth if required)

failures here look like “build broke,” not “site runtime broke”

That’s acceptable given your priorities, but it’s the main operational dependency remaining.

D) Idempotency depends on order.status === 'paid'

This is the correct place to gate duplicates (in orders service webhook handler). The risk is only if some other code marks orders paid early before membership creation runs.

Given your current structure, that seems unlikely (and tests passing supports it). Just keep the invariant:

“paid” should only be set in the webhook completion path (or an equivalent single place).

E) Membership block admin UX: Plans required

You observed this: the block requires selecting “Plans” even though plans exist globally. That’s intended with your “block defines which plans are shown on this page” model. It’s a valid design, but the UX can surprise admins.

Not a functional risk, just a CMS authoring friction point.
