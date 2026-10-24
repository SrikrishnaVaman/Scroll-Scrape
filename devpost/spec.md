---
doc: spec
status: approved
---

# Scroll Scrape: Technical Specification

| | |
|---|---|
| **Project** | Scroll Scrape |
| **Author** | Krishna (solo) |
| **Event** | Devpost Learn, Build With AI: Basics |
| **Document** | Technical specification, the third of three planning documents (scope, PRD, spec) |
| **Date** | 24 October 2026 |
| **Status** | Approved |

Implements `prd.md` (approved 24 October 2026, revised the same day to bring sign-in into the build). Kernel: `scope.md > The Unique Kernel`.

## How This Works, In Plain Language

Scroll Scrape is one **Next.js** project. Next.js is React with a server built in. It has two halves that live in the same folder:

- **The screens** (Home, Saved, Add, Plan, Profile, City View, Place Details, Memories) are React pages that run in the user's browser.
- **The backend** is a handful of small server routes that run on Vercel's servers. They exist for one reason: the app talks to outside services that need secret keys, and anything in the browser can be seen by anyone. The browser asks the backend, and the backend talks to the outside services with the keys and passes back only the answer.

Three outside services do the heavy lifting:

1. **Supabase** is the app's memory. It handles **sign-in** (email, password and username), stores the user's **city spaces and places** in a database (think of it as a spreadsheet with one sheet per kind of thing), and stores **photos** as files. Each user can only ever read their own rows; Supabase enforces this itself.
2. **Gemini** (Google's AI model) is the app's reasoning. It **reads** a caption or screenshot and works out the place and city, **estimates** when a place is usually busy, and **plans** a day by choosing from the user's saved places.
3. **Google Maps** is the app's source of facts. It turns "[café name], Singapore" into a real place with an address, map position, opening hours, rating and price range. It measures **travel time** between stops and draws the **city map** with pins.

The rule that keeps the product honest: **Gemini finds and chooses; Google Maps supplies the facts.** Hours, ratings, addresses and travel times always come from Google Maps. The only thing the AI guesses is how busy a place usually is, and the app labels that as an AI estimate. The plan route also checks every place Gemini suggests against the user's saves and drops anything that isn't there.

**Why this shape.** One project, one deployment (Vercel, free), and one data service (Supabase) that covers sign-in, the database and photos together. This was the smallest setup that meets Krishna's requirements: online for judges, a real login, and data kept safely rather than in the browser.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. **Sign in.** The user signs up on `/signup` with email, password and username. Supabase creates the account and the browser keeps a sign-in cookie. Every page after this knows who the user is.
2. **Arrive on Home.** The page asks Supabase for the user's city spaces and draws them as dots on a flat world-map illustration, with the flamingo waiting.
3. **Save a post** (`/add`). The user pastes a link plus caption, or drops a screenshot. The browser sends it to the backend route **`/api/identify`**.
   - The backend asks **Gemini**: "What place, what type, what city?" Gemini answers in a fixed JSON shape.
   - The backend asks **Google Maps Text Search** for "place name, city" and gets a place ID, then **Place Details** for its address, location, hours, rating and price range.
   - The browser shows the **confirmation card**. If Gemini wasn't confident, the backend asks for comments or returns the flamingo's questions instead.
4. **Confirm.** The browser sends the confirmed card to **`/api/places`**. If no space exists for that city, the browser first shows the flamingo's "Create a space for Singapore?" prompt and only proceeds on yes. The backend asks Gemini for a short busy-times estimate and a cost-per-person estimate when Google gives no price range, then writes the space (if new) and the place to **Supabase**.
5. **Browse.** On Home, the user types "Singapore". The flamingo flies across the map to Singapore's dot, then the app opens **`/city/[spaceId]`**, where the **Google Maps** map shows a pin per saved place, plus a list. Tapping one opens **`/place/[placeId]`**, which reads everything from Supabase. No new Google calls are needed because the facts were stored at save time.
6. **Plan** (`/plan`). The user types to the flamingo. The browser sends the conversation to **`/api/plan`**.
   - The backend loads that user's saved places for the named city from Supabase.
   - It gives Gemini the request and that list, and asks for stops that reference places **by their ID**.
   - It discards any ID that isn't in the list, checks opening hours against each suggested time, and asks **Google Routes** for travel times between consecutive stops.
   - It returns the plan, saves it to Supabase, and the flamingo shows the stop cards and asks about the rest of the day. If nothing matches, the reply is "Not found on your list."
7. **Remember** (`/add` → *Add photos*). The browser reads each photo's location and date from inside the file, finds the nearest saved place within 200 metres, shrinks the photo to about 250 KB, and uploads it to **Supabase Storage**. The place is marked visited, and **`/memories`** shows the photos grouped by place and date.

## Stack

| Piece | Choice | Why | Docs |
|---|---|---|---|
| Framework | **Next.js 16** (App Router), latest 16.4 at time of writing | Krishna's choice: React he knows, plus server routes for secret keys and one-step deployment. Accepted tradeoff: learning Next.js conventions. | https://nextjs.org/docs |
| Language | **TypeScript** | *Recommendation, open to change:* the editor catches mistakes such as a misspelt field before the app runs, which helps while learning. Plain JavaScript also works. | https://nextjs.org/docs/app/getting-started/installation |
| Styling | **Tailwind CSS** (included by `create-next-app`) | Fast to style a consistent light theme without separate CSS files. | https://tailwindcss.com/docs |
| Icons | **lucide-react** | Simple, consistent icons for the dock. | https://lucide.dev |
| Sign-in, database, file storage | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Krishna's choice after comparing free limits with Appwrite and PocketBase: one service covers login, database and photos, with strong Next.js guides. | https://supabase.com/docs/guides/auth/server-side/nextjs |
| AI | **Gemini** via `@google/genai`, model **`gemini-3.5-flash-lite`** (verify on day one) | Krishna's choice: free tier, reads images, good at extracting names. Flash-Lite because the free tier reportedly allows far more requests per day than Flash. | https://ai.google.dev/gemini-api/docs |
| Places, routes, map | **Google Maps Platform**: Places API (New), Routes API, Maps JavaScript API via `@vis.gl/react-google-maps` | The real-data source the PRD requires for hours, ratings and travel times. | https://developers.google.com/maps/documentation/places/web-service/op-overview |
| Photo location and date | **exifr** (reads data stored inside photo files) | Small, runs in the browser. | https://github.com/MikeKovarik/exifr |
| Photo shrinking | **browser-image-compression** | Keeps photos near 250 KB so 1 GB of storage holds about 4,000. | https://github.com/Donaldcwl/browser-image-compression |
| Hosting | **Vercel** (Hobby, free), connected to the GitHub repo | Made by the Next.js team; every push to `main` goes live. | https://vercel.com/docs |

**To verify on day one** (checked on 24 October 2026 from public pages, but limits change):
- The exact Gemini model name and its **live free quota** in Google AI Studio (Google no longer publishes a fixed table; developer reports in September 2026 cite about 500 requests a day for Flash-Lite and about 20 for Flash).
- Whether Supabase's Next.js guide for Next.js 16 uses a `middleware.ts` or `proxy.ts` file for refreshing sign-in cookies.

## Where It Runs and How Someone Tries It

**Live:** a Vercel URL (for example `scroll-scrape.vercel.app`), deployed from the public GitHub repo. This gives judges the free testing access the rules ask for, alongside the demo video.

**How a judge tries it:**
1. Open the live URL.
2. Either **sign up** with any email, password and username (no confirmation email; see *Supabase Auth*), or sign in to the **demo account** whose details are in the Devpost submission and README. It is pre-filled with real Singapore places.
3. On Plan, ask the flamingo for a day out.

**Running locally:**
```
npm install
cp .env.example .env.local     # then fill in the keys below
npm run dev                    # open http://localhost:3000
```

**Environment variables** (in `.env.local` locally and in Vercel's project settings; never committed):

| Name | Used by | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser and server | no |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (older dashboards call it the anon key) | browser and server | no; safe because the database rules protect each user's rows |
| `SUPABASE_SECRET_KEY` (service role) | the demo seed script only | **yes** |
| `GEMINI_API_KEY` | server routes | **yes** |
| `GOOGLE_MAPS_SERVER_KEY` (Places and Routes only) | server routes | **yes** |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` (Maps JavaScript only, limited to the app's web addresses) | browser map | visible by design, locked to the site |

**Recording the demo:** record against the live URL, signed in to a fresh account for the save step and to the demo account for planning.

## Look and Feel

Carries forward `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Palette:** few colours, bright but calm.
  - Background: warm off-white `#FFF8F3`. Surface: white `#FFFFFF`.
  - Primary: **flamingo pink** `#F2668B`, used for the flamingo, the active dock button and primary buttons.
  - Secondary: **lagoon blue** `#3FA7D6`, used for water on the world map, links and the "AI estimate" chip.
  - Text: ink `#2B2A33`, muted `#6E6A72`. Borders: `#EFE6E0`.
  - Light theme only.
- **Typography:** one rounded, friendly sans for everything, **Nunito** via `next/font/google`. Headings 600–700 weight, body 400, generous line height.
- **Shapes and density:** rounded cards (16 px radius), soft shadows, lots of white space (mymind). Place cards are photo-led where a photo exists, otherwise a pastel tile with the place type's icon (ReciMe).
- **Dock:** a floating white pill at the bottom with five icon-and-label buttons; the active one is pink. Always visible on main screens.
- **The flamingo:** one simple SVG illustration drawn for this project in pink and coral, with a few poses (waiting, talking, flying), so there are no licensing issues for the video.
- **World map:** a flat, simplified world map SVG from a public-domain source (Natural Earth), with land in a soft sand tone and water in lagoon blue.
- **Voice:** the flamingo speaks in short, friendly sentences ("Found it! Is this the place?").
- **Estimates:** every AI estimate carries a small blue "AI estimate" chip.

## Components

### Sign-in and Profile
Implements `prd.md > Profile`.

- Pages `/login` and `/signup`: email, password, and username (sign-up only). These use Supabase Auth's email-and-password sign-in.
- After sign-up, a `profiles` row stores the username.
- The middleware file (see *Stack*, to verify) refreshes the sign-in cookie and sends signed-out visitors to `/login`.
- `/profile` shows the username, email, counts (places saved, cities, places visited) and a sign-out button.

### Dock and App Shell
Implements `prd.md > Screens and Layout`.

- `app/(app)/layout.tsx` wraps every signed-in page with the `Dock` component (Home, Saved, Add, Plan, Profile).

### Home and World Map
Implements `prd.md > Home and City Search`.

- `WorldMap` draws the flat map SVG and places a dot for each city space. It converts latitude and longitude to x and y with a simple equirectangular projection, so no map service is needed here.
- `Flamingo` sits on the map. On search, it moves to the city's dot with a CSS transform animation (about 1.2 seconds), then the app navigates to City View. Fallback: navigate immediately.
- The search box filters the user's own city spaces by name. If there's no match, the flamingo says nothing is saved there yet and offers a link to Add.
- A shortcut button opens Memories.

### Add: Save a Post
Implements `prd.md > Saving a Place`.

- `/add` has two tabs: **Save a post** and **Add photos**.
- *Save a post* form fields: post link (required), caption (text), comments (optional text), and screenshot (optional image, sent as base64).
- Calls `POST /api/identify` and shows `ConfirmCard` with editable name, type and city. Editing the name or city and pressing "Look up again" calls `POST /api/lookup`.
- Fallback path: when the identify route returns `needs: "comments"`, the form highlights the comments field. When it returns `needs: "questions"`, the flamingo asks the returned questions one by one, then resubmits with the answers.

### City Spaces
Implements `prd.md > City Spaces`.

- Before saving, the browser checks whether the user has a space for the card's city and country. If not, the flamingo's prompt appears; on **Yes** the save goes ahead with `createSpace: true`. On **No**, it returns to the card.
- `/saved` lists spaces with their place counts, newest first.

### City View
Implements `prd.md > City View and Place Details`.

- `/city/[spaceId]` renders `CityMap` (Google Maps JavaScript map via `@vis.gl/react-google-maps`), centred on the space, with one marker per place, plus `PlaceList` beside or below it.
- Tapping a marker or list item opens `/place/[placeId]`.

### Place Details
Implements `prd.md > City View and Place Details`.

- `/place/[placeId]` reads one `places` row: name, type, area, opening hours (formatted for today and the week), busy times with the "AI estimate" chip, cost per person, rating with the number of reviews, the original post link, visited status, and the place's photos.
- Missing fields show "Not available" (`prd.md > States and Boundaries`).

### Plan With the Flamingo
Implements `prd.md > Planning With the Flamingo`.

- `/plan` is a chat layout: flamingo bubbles on the left, user bubbles on the right, and `PlanStop` cards inside the flamingo's replies.
- Each send calls `POST /api/plan` with the conversation so far, so follow-ups like "yes, plan the afternoon too" have context.
- `PlanStop` shows the purpose label, suggested time, place name, today's hours (with a warning if the time falls outside them), the busy-times estimate, cost per person and, between cards, the travel time. Each card links to Place Details.
- The page keeps the conversation while it is open; each finished plan is also saved to the `plans` table.

### Memories
Implements `prd.md > Memories`. Built last; first to drop.

- *Add photos* tab: the user drops images. For each one, the browser reads latitude, longitude and the date taken (exifr) **before** shrinking it, because shrinking strips that information. It then finds the nearest saved place within 200 m, compresses the photo, uploads it to the private `photos` storage bucket, inserts a `photos` row, and sets the place's `visited = true`.
- Photos without location, or more than 200 m from any saved place, appear in an "Unmatched" list with a place picker.
- `/memories` shows photos grouped by place, newest outing first, in a calm masonry grid.

### Server Routes

All routes check the signed-in user from the Supabase cookie and return `401` otherwise.

#### `POST /api/identify`
Input: `{ url, caption?, comments?, screenshotBase64?, answers? }`.
1. Gemini call (`lib/prompts.ts > IDENTIFY_PROMPT`) with JSON output `{ placeName, placeType, city, country, confidence: "high"|"low", questions?: string[] }`.
2. If `confidence` is low and there are no comments yet → return `{ needs: "comments" }`. If it is still low → return `{ needs: "questions", questions }`.
3. Otherwise Google Text Search with `"{placeName}, {city}"` (field mask `places.id`), then Place Details for the first result.
4. Return the card: `{ googlePlaceId, name, type, address, lat, lng, city, country, openingHours, rating, ratingCount, priceLevel, priceRange, googleMapsUri }`. If Google finds nothing, return the Gemini fields with `googlePlaceId: null` so the user can still save.

#### `POST /api/lookup`
Input: `{ name, city }`. Runs step 3 only and returns the same card shape.

#### `POST /api/places`
Input: the confirmed card plus `{ postUrl, caption, source: "link"|"screenshot", createSpace }`.
1. Gemini call (`ENRICH_PROMPT`): `{ busyTimes: string, costPerPerson: string }`. Cost comes from Google's `priceRange` when present; Gemini estimates it only when Google has none.
2. Find or create the `spaces` row (only if `createSpace` is true or the space already exists).
3. Insert the `places` row and return it.

#### `POST /api/plan`
Input: `{ messages: [{ role, text }] }`.
1. Gemini call (`PLAN_PROMPT`, part 1) to read the city from the conversation. If no city is named → reply asking which city.
2. Load the user's places in that city's space (id, name, type, area, hours, rating, price, busy times, location).
3. Gemini call (`PLAN_PROMPT`, part 2) with the request and the list. JSON output: `{ stops: [{ placeId, purpose, suggestedTime, reason }], notFound: string[], followUp: string }`. The prompt states: choose only from the list, refer to places only by `placeId`, and put unmatched parts in `notFound`.
4. **Guard:** drop any `placeId` that isn't in the user's list.
5. Google **Compute Route Matrix** for consecutive stops (travel mode: transit, falling back to driving if transit returns nothing).
6. Insert into `plans`; return `{ stops (with place data, travel minutes, openAtTime), notFound, followUp }`. With no stops at all, the reply text is "Not found on your list."

Steps 1 and 3 can be combined into one Gemini call if the daily quota turns out to be tight.

### AI Prompts
`lib/prompts.ts` holds the three prompts (identify, enrich, plan) with their JSON response schemas, using Gemini's structured output so replies always parse. Keeping them in one file makes them easy to read, tune and show in the demo.

## Data Model

Supabase Postgres. Every table has `user_id` and **row-level security**: a user can select, insert, update and delete only rows where `user_id = auth.uid()`.

```
profiles   id (= auth user id) · username · created_at
spaces     id · user_id · city · country · center_lat · center_lng · created_at
           unique (user_id, city, country)
places     id · user_id · space_id → spaces
           google_place_id · name · place_type · address · lat · lng
           opening_hours (json) · rating · rating_count · price_level · price_range (json)
           cost_per_person (text) · busy_times (text, AI estimate)
           post_url · caption · source ('link' | 'screenshot')
           visited (bool, default false) · created_at
photos     id · user_id · place_id → places (null when unmatched)
           storage_path · taken_at · lat · lng · created_at
plans      id · user_id · space_id → spaces · request (text) · result (json) · created_at
```

**Storage:** a private bucket `photos`, with files at `{user_id}/{photo_id}.jpg`. Policies let a user read and write only their own folder, and the app shows photos through short-lived signed links.

| Data | Where it lives | How it's updated | When the user leaves and returns |
|---|---|---|---|
| Account, username | Supabase Auth + `profiles` | sign-up | still signed in (cookie) until sign-out |
| City spaces, places | Supabase tables | Add flow, via `/api/places` | all there, on any device |
| Place facts (hours, rating, price) | `places` row | fetched once at save time | shown from the row; not refreshed in the proof of concept |
| Photos | Supabase Storage + `photos` | Add photos | all there |
| Plans | `plans` | each finished plan | saved, though the chat on screen starts fresh |
| Chat in progress | page memory in the browser | each message | cleared on leaving Plan |

**Schema and policies** live in `supabase/migrations/001_init.sql`, which is run once in the Supabase SQL editor, so the database setup sits in the repo next to the code.

## File Structure

```
scroll-scrape/
├── app/
│   ├── layout.tsx                 # fonts (Nunito), colours, <html>
│   ├── globals.css                # Tailwind + palette variables
│   ├── (auth)/
│   │   ├── login/page.tsx         # email + password
│   │   └── signup/page.tsx        # email + password + username
│   ├── (app)/                     # everything behind sign-in
│   │   ├── layout.tsx             # app shell with the Dock
│   │   ├── page.tsx               # Home: world map, flamingo, city search
│   │   ├── saved/page.tsx         # city spaces list
│   │   ├── city/[spaceId]/page.tsx    # City View: map + list
│   │   ├── place/[placeId]/page.tsx   # Place Details
│   │   ├── add/page.tsx           # Save a post | Add photos
│   │   ├── plan/page.tsx          # flamingo chat
│   │   ├── memories/page.tsx      # photo grid
│   │   └── profile/page.tsx       # username, counts, sign out
│   └── api/
│       ├── identify/route.ts      # Gemini reads post → Google finds place
│       ├── lookup/route.ts        # re-look-up after edits
│       ├── places/route.ts        # enrich + save place (+ space)
│       └── plan/route.ts          # plan from saves only
├── components/
│   ├── Dock.tsx
│   ├── Flamingo.tsx               # SVG, poses: waiting | talking | flying
│   ├── WorldMap.tsx               # flat map + city dots + flight animation
│   ├── ConfirmCard.tsx
│   ├── SpacePrompt.tsx            # "Create a space for Singapore?"
│   ├── CityMap.tsx                # Google map with pins
│   ├── PlaceList.tsx
│   ├── PlaceCard.tsx
│   ├── PlanStop.tsx
│   ├── ChatBubble.tsx
│   ├── PhotoDrop.tsx
│   └── EstimateChip.tsx           # the blue "AI estimate" label
├── lib/
│   ├── supabase/client.ts         # browser Supabase client
│   ├── supabase/server.ts         # server Supabase client (reads cookie)
│   ├── gemini.ts                  # one helper: ask Gemini, get typed JSON
│   ├── prompts.ts                 # IDENTIFY, ENRICH, PLAN prompts + schemas
│   ├── maps.ts                    # textSearch, placeDetails, routeMatrix
│   ├── geo.ts                     # distance in metres, lat/lng → map x/y
│   ├── photos.ts                  # read EXIF, compress, upload, match
│   └── types.ts                   # Space, Place, Photo, Plan, PlaceCard
├── proxy.ts                       # refresh sign-in, guard pages (Next.js 16 name for middleware)
├── supabase/
│   └── migrations/001_init.sql    # tables, row-level security, storage policies
├── scripts/
│   └── seed-demo.ts               # creates the demo account + sample places
├── public/
│   ├── flamingo/*.svg
│   └── world-map.svg              # public-domain (Natural Earth based)
├── devpost/                       # scope, PRD, spec, pitch, checklist
├── .env.example                   # names of all keys, no values
├── LICENSE                        # MIT (open-source licence required)
└── README.md                      # what it is, live link, demo account, setup
```

## External Services and Dependencies

Prices and limits were checked on 24 October 2026 and should be re-checked during setup.

### Supabase Auth
- Email-and-password sign-up and sign-in via `supabase.auth.signUp` and `signInWithPassword`, with the username in `options.data` and then copied to `profiles`.
- **Setting:** turn **"Confirm email" off** (Authentication → Providers → Email). Supabase's built-in email sender is heavily rate-limited, and judges should be able to sign up instantly.
- Docs: https://supabase.com/docs/guides/auth/passwords

### Supabase Database and Storage
- Accessed with `@supabase/supabase-js` from both the browser and the server, under row-level security.
- **Free plan:** 500 MB database, 1 GB file storage, 50,000 monthly active users, 5 GB egress, 2 active projects; **projects pause after 1 week of inactivity**. Source: https://supabase.com/pricing
- Docs: https://supabase.com/docs/guides/database/postgres/row-level-security · https://supabase.com/docs/guides/storage

### Gemini API
- `@google/genai`: `ai.models.generateContent({ model, contents, config: { responseMimeType: "application/json", responseSchema } })`. Screenshots are sent as inline image data.
- **Free tier:** Flash and Flash-Lite models only, and no card needed. Google no longer publishes fixed limits; the live quota is shown in AI Studio per project. Developer reports (September 2026) cite about 500 requests a day on 3.x Flash-Lite and about 20 on 3.x Flash.
- **Free-tier data** may be used by Google to improve its products, so the app should not handle anything sensitive (it doesn't).
- **Paid fallback:** prepaid billing (minimum $5 credit, which cannot be overspent) at about $0.30 per million input tokens for 3.5 Flash-Lite. A demo would cost cents.
- Expected use: 2 calls per saved place and 1–2 per plan message.
- Sources: https://ai.google.dev/gemini-api/docs · https://geotoolbox.ai/blog/gemini-api-pricing · https://agentdeals.dev/gemini-api-pricing-changes

### Google Maps Platform
A billing account with a card is required; usage below the free monthly caps costs nothing. Set **quotas** on each API (Google Cloud Console → APIs → Quotas) slightly below the free caps so usage can't exceed them.

| Call | Endpoint | Fields | Free per month |
|---|---|---|---|
| Find the place | `POST https://places.googleapis.com/v1/places:searchText` | `places.id` (IDs only) | unlimited |
| Place facts | `GET https://places.googleapis.com/v1/places/{id}` | `id,displayName,formattedAddress,location,primaryType,googleMapsUri,regularOpeningHours,rating,userRatingCount,priceLevel,priceRange` (Enterprise SKU) | 1,000 |
| Travel times | `POST https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix` | `originIndex,destinationIndex,duration,condition` | 10,000 elements |
| City map | Maps JavaScript API (Dynamic Maps) | — | 10,000 loads |

- Auth: header `X-Goog-Api-Key` and a required `X-Goog-FieldMask`.
- Place facts are the tight limit (1,000 a month). That's why they're fetched **once at save time** and stored, never on every view.
- Sources: https://developers.google.com/maps/billing-and-pricing/pricing · https://developers.google.com/maps/documentation/places/web-service/data-fields · https://developers.google.com/maps/documentation/routes/compute_route_matrix

### Vercel
- Hobby (free) plan. Import the GitHub repo, add the environment variables, and every push deploys.
- Docs: https://vercel.com/docs/frameworks/nextjs

## Important Failure Modes

- **Gemini's free daily quota runs out** (error 429), most likely during judging → the flamingo says "I need a short rest, try again in a minute," and nothing breaks. **Prevention:** use Flash-Lite, check the live quota on day one, and if it's low, add the $5 prepaid credit before submitting.
- **Gemini can't identify the place** → comments, then the flamingo's questions (`prd.md > Saving a Place`).
- **Google can't find the place** → the card shows Gemini's name and city with "Not on Google Maps." The user can still save it, and its hours and rating show "Not available."
- **Gemini suggests a place that isn't saved** → the plan route drops it before the user sees it, so "only your saves" is enforced in code, not just requested in the prompt.
- **Photo has no location data** (common when a photo is sent through a messaging app) → it goes to the "Unmatched" list with a place picker.
- **Supabase project paused for inactivity** → open the app at least every few days until judging ends (30 October); unpausing takes a click in the dashboard.

## What Was Simplified and Why

- **A flat world map with a CSS flight** instead of a rotating 3D globe (Krishna's PRD decision). A globe would need a 3D library and much more tuning.
- **City search covers the user's own spaces only**, not any city in the world. Because the app is built only from saves, searching somewhere with no saves can only say "nothing saved here". Worldwide city lookup would add a geocoding call for no demo value.
- **Place facts fetched once at save time, not refreshed.** This keeps within the 1,000-a-month free allowance for place facts. A fuller version would refresh hours weekly.
- **Busy times are a one-line AI estimate stored at save time**, not live data (`scope.md > Explicitly Cut`).
- **Photo matching by distance (200 m), with the date used to group** outings, rather than a smarter match. It's good enough for a demo outing.
- **Email and password only**, with confirmation emails off. Google sign-in and email verification are left for later.
- **The chat on Plan isn't restored** after leaving the page; finished plans are saved.
- **Demo data:** the demo account is filled by `scripts/seed-demo.ts` with real Singapore places looked up through Google. It is labelled in the README as a demo account and can be reset by re-running the script.

## Decisions and Open Issues

### Decisions made by Krishna
- **Next.js**, accepting the cost of learning its conventions, over React plus a separate Python backend.
- **Online on Vercel**, because a laptop-only app "won't cut it" for judging.
- **Login and an online database** (Supabase) rather than browser storage, so data is safe and each person has their own account. This revised the approved PRD, which has been updated.
- **Supabase over Appwrite and PocketBase**, after Krishna checked the free limits himself.
- **Schema:** users, city spaces, places and photos as proposed, sign-in with email and username, no extra personal details.
- **Gemini** as the AI, for its free tier.
- **Google Maps billing** with Krishna's debit card, provided usage stays within the free allowance (enforced by quotas).

### Recommendations derived from those decisions (open to change)
- TypeScript, Tailwind, `@vis.gl/react-google-maps`, exifr, browser-image-compression.
- Gemini 3.5 Flash-Lite as the model; confirmation emails off; a demo account; place facts stored at save time; the plan route's ID guard.
- Palette, Nunito font and flamingo illustration details in *Look and Feel*.

### The learning question
Krishna's open question during this step was whether Supabase's free tier would be enough (500 MB database, 1 GB storage, 50,000 users). The answer: text data is tiny, so storage of photos is the only real limit. Shrinking photos to about 250 KB in the browser raises capacity from about 300 to about 4,000 photos. Another limit came up in the same check: projects pause after a week idle, which the failure modes cover. An earlier concept from this step was **why a backend exists at all**: secret keys can't live in the browser.

### Open issues
1. **Gemini free quota** (to check on build day one). If Flash-Lite's live quota in AI Studio is under about 200 requests a day, add the $5 prepaid credit before submission.
2. **The middleware file name** in Next.js 16 for Supabase sign-in. *Resolved 24 October 2026:* Supabase's Next.js guide uses `proxy.ts`, because Next.js 16 renamed `middleware.ts`, and recommends `getClaims()` to check the session.
3. **Name of the photo area**, "Memories" for now (`prd.md > Open Questions`). Can wait.
4. **Build time.** With login added, the eight PRD build items are a lot for the time left (deadline 27 October, 5:00 am Singapore time). If time runs short, cut in this order: Memories, then the flamingo flight (keep the map), then the plan's rest-of-day follow-up.
