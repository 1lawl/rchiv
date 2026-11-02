# rChiv

A social marketplace for archive fashion: show off pieces, get wants and offers, trade, and hunt Japanese marketplaces with Finder Japan.

This is the first working prototype. Everything runs on mock data except Finder Japan, which can search Mercari live through a small Python service.

## What's in here

```
src/app/            Screens. Every file is a page (Expo Router).
  (tabs)/           The five tabs: index (Home), finder, post, messages, closet
  piece/[id].tsx    One piece
  offer/[id].tsx    Offer / trade / buy sheet
  chat/[id].tsx     A conversation with its deal card
  instant/[id].tsx  Full-screen Instant
  japan/[id].tsx    A Finder Japan listing with proxy-buy links
src/components/     Shared pieces: glass surfaces, icons, swipe deck, photo tiles
src/theme/          Colours and type from the approved design (light glass + dark)
src/data/mock.ts    All the fake pieces, chats, instants
src/store/          App state (wants, posted pieces, deals), saved on the phone
src/lib/            Finder Japan client
server/             Finder Japan service (Python), built from jpbot
```

## Why this stack

- **Expo + React Native (TypeScript).** One codebase for iPhone, Android and web. You can run it on your own phone in seconds with the free Expo Go app, no Xcode or app store needed. When it's time for TestFlight / the App Store, Expo's EAS builds it in the cloud.
- **Python for Finder Japan.** jpbot is already Python and mercapi is a Python library, so the judging logic carries over almost line for line.
- **No backend yet.** Accounts, real listings, payments and chat come next (see ROADMAP.md). Keeping it mock-only for now means the design can still change cheaply.

## Run the app on your phone

You need [Node.js](https://nodejs.org) (LTS) on your computer and the **Expo Go** app on your phone.

```bash
npm install
npx expo start
```

Scan the QR code with your phone's camera (iPhone) or the Expo Go app (Android). The phone and computer need to be on the same Wi-Fi. Save a file and the app reloads on the phone.

Other ways to look at it:
- `npx expo start --web` opens it in a browser.
- `npx tsc --noEmit` checks the code for type mistakes.

## Run Finder Japan live

```bash
cd server
python3 -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn finder_japan.app:app --host 0.0.0.0 --port 8787
```

Then start the app pointing at it (use your computer's local IP so the phone can reach it):

```bash
EXPO_PUBLIC_FINDER_URL=http://192.168.1.20:8787 npx expo start
```

Without the service the Japan tab shows sample results and says so.

- Brands live in `server/brands.txt`, same format as jpbot (`English | 日本語 | also: ALIAS`, `off:` / `fav:` prefixes). Drop your own jpbot `brands.txt` and `exclude.txt` in.
- The real-vs-fake filter is `server/finder_japan/judge.py`. Its tests: `python -m pytest server/tests`.
- Only Mercari is wired up. Yahoo Auctions and Rakuma are next (they plug into `SOURCES` in `app.py`).
- Mercari's terms forbid commercial use of its data without written permission. Keep this personal / prototype until there's a partnership or a proxy-partner feed.

## Your own photos

The mock pieces show soft grey placeholders. To use real photos, put images in `assets/pieces/` and set `photo` on a piece in `src/data/mock.ts`, or just use the Post tab: it takes photos from your camera roll.

## Web preview link

`scripts/build-preview.py` turns the web build into one HTML file that can be shared as a link:

```bash
EXPO_PUBLIC_WEB_PREVIEW=1 npx expo export --platform web
python3 scripts/build-preview.py preview.html
```
