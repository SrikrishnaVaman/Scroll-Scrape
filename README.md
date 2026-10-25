# Scroll Scrape

**Saved places become plans.** Scroll Scrape turns the restaurants, cafés, parks and arcades you save from Instagram into a timed, ready-to-go day out, built only from places you chose yourself.

- **Save** a place from a screenshot of the post (or a paused frame of a reel), with the caption and link if you have them. Gemini reads it, Google Maps supplies the real facts, and you confirm.
- **Browse** your saves by city on a world map, where a flamingo flies you to the city you search for.
- **Plan** by telling the flamingo what you feel like ("a casual lunch with friends and a cozy dinner in Singapore"). It picks only from your saved places, with real opening hours and travel times, and offers to fill the rest of the day.

Built for Devpost's *Build With AI: Basics* hackathon.

## Try it

**Live:** _link added after deployment_

Sign up with any email, password and username (no confirmation email), or use the demo account, which is filled with real Singapore places:

| Email | Password |
|---|---|
| `demo@scrollscrape.app` | `flamingo-demo-2026` |

Then open **Plan** and ask for a day out in Singapore.

## How it works

One Next.js app, deployed on Vercel:

- **Screens** (Home, Saved, Add, Plan, Profile, City View, Place Details) are React pages.
- **Server routes** in `app/api/` hold the secret keys and talk to the outside services:
  - `identify`: Gemini reads the post; Google Places finds the place.
  - `lookup`: looks a place up again after you edit it.
  - `places`: saves the place, with an AI busy-times estimate.
  - `plan`: plans from your saves only.
- **Supabase** handles sign-in and stores everything. Row-level security means each person can only ever read their own rows.
- **Gemini** (`gemini-3.5-flash-lite`) finds and chooses. **Google Maps** supplies the facts (hours, ratings, prices, travel times). The only AI guess shown is how busy a place usually is, and it is labelled "AI estimate".
- The planner may only answer with IDs of your saved places, and `lib/guard.ts` drops anything else. So "only your saves" is enforced in code, not just in the prompt.

## Run it locally

You need Node.js 20+, a Supabase project, a Gemini API key, and a Google Cloud project with Places API (New), Routes API and Maps JavaScript API enabled.

```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev                  # http://localhost:3000
```

Set up the database once: in Supabase's SQL Editor, run the files in `supabase/migrations/` in order. Then turn off **Confirm email** under Authentication → Sign In / Providers → Email.

Useful scripts:

```bash
npm run seed:demo    # create or reset the demo account with real Singapore places
npm run check:auth   # check sign-up, sign-in and row-level security
node scripts/check-guard.ts   # check the "only your saves" guard
node scripts/check-geo.ts     # check cities land in the right place on the world map
```

## Credits

- World map shapes: [Natural Earth](https://www.naturalearthdata.com/) (public domain), via [world-atlas](https://github.com/topojson/world-atlas).
- The flamingo was drawn for this project.
- Icons: [Lucide](https://lucide.dev).

## Licence

MIT. See [LICENSE](LICENSE).
