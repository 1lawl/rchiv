# rChiv build roadmap

Each stage ends with something you can hold in your hand and show someone. Rough sizes assume you learning as you go with Claude doing most of the typing.

## Stage 1 — Tap-through prototype (done, Nov 2026)
All five tabs from the approved design, both themes, swipe deck, offers / trades / buy-now with the 3% capped fee, chats with deal cards, Instants, Post from camera roll, Closet. Finder Japan with the jpbot filter and a live Mercari source.

**Use it for:** feedback from 10 to 20 people in the archive community, early investor conversations.

## Stage 2 — Real photos and polish (1 to 2 weeks)
- Your own IG photos on the mock pieces, so the board looks like the exhibit wall it is meant to be.
- Piece photo gallery (swipe between front / back / tag / label / flaws).
- Brand and season archive pages (where write-ups and discussion now live).
- App icon, splash screen, onboarding (pick Brand / Mix / Aesthetic, follow a few brands).
- Ship to your own phone as a real app through TestFlight (EAS build).

## Stage 3 — Real accounts and listings (3 to 5 weeks)
Backend recommendation: **Supabase** (hosted Postgres + sign-in + photo storage + realtime chat). It has a generous free tier, works well with Expo, and you can read your data in a spreadsheet-like table view, which helps while learning.
- Sign in with Apple / Google / email.
- Posting saves to the database; photos to storage.
- Wants, follows, the For you / Following feed from real data.
- Messages and Instants in realtime.

## Stage 4 — Money (3 to 4 weeks)
- **Stripe Connect** for payments: buyer pays, rChiv holds funds until delivery is confirmed, seller is paid out. The 3% capped fee is taken automatically.
- Shipping labels and tracking (Shippo or EasyPost).
- Trades: both ship with tracking, both confirm arrival.
- Reviews and the portable reputation score.

## Stage 5 — Finder Japan as a product (in parallel with 3 and 4)
- Move the service to a small cloud server (Fly.io or Railway) with a shared per-brand index and a schedule (every few minutes).
- Yahoo Auctions and Rakuma sources; translated titles; auction-ending reminders.
- Push alerts for new genuine listings.
- Before charging for it: get permission, a partnership, or a proxy-partner feed (Buyee / ZenMarket affiliate programs are the realistic first step).

## Stage 6 — Closed beta
TestFlight + Android internal testing for 50 to 200 collectors, seeded from your network. Track: pieces posted, wants per piece, offers sent, trades completed.

## Open decisions
- Who pays card processing (buyer, seller, or split)?
- Authentication approach (photo checklist + community flags first, paid expert checks later?).
- Finder Japan subscription price.
