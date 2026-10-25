---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. You can sign up, sign in, and land on your own Home**
  Becomes usable: A running Scroll Scrape where a new visitor creates an account (email, password, username), lands on an empty Home inside the app shell with the five-button dock, and signs out from Profile. Signed-out visitors are sent to the login page.
  Why now: Every later screen and every saved row depends on knowing who the user is, and Supabase plus the Next.js 16 sign-in file are the first unfamiliar pieces. Bootstrapping (Next.js scaffold, Tailwind palette, Nunito, Supabase clients, database schema with row-level security) lands here so later slices have somewhere to go.
  PRD ref: `prd.md > Profile`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Components > Sign-in and Profile`, `spec.md > Components > Dock and App Shell`, `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > External Services and Dependencies > Supabase Auth`
  Build: Scaffold Next.js 16 (TypeScript, Tailwind, App Router) in this folder; add `.env.example`, MIT `LICENSE`; write `supabase/migrations/001_init.sql` (all tables, row-level security, private `photos` bucket policies) for Krishna to run in the Supabase SQL editor; add `lib/supabase/client.ts` and `server.ts`, and `proxy.ts` (Next.js 16's renamed middleware) to refresh the sign-in cookie and guard pages; build `/signup`, `/login`, the `(app)` layout with `Dock`, an empty-state Home, and `/profile` with username, email and sign out.
  Verify (mechanical): `npm run build` passes; `npm run dev` starts cleanly; `curl` on `/` while signed out redirects to `/login`; a scripted sign-up then sign-in through Supabase returns a session and creates a `profiles` row; a second user cannot read the first user's `profiles` row.
  Learner check: Open http://localhost:3000, create an account with your own email and a username, check that you land on Home with the dock, open Profile to see your username, sign out, and sign back in.
  Commit: `Add sign-up, sign-in, app shell and database schema`

- [x] **2. You can save an Instagram post as a real place in a city space**
  Becomes usable: On Add > Save a post, pasting a post link with its caption (or dropping a screenshot) shows a confirmation card with the place name, type, city and Google address. Editing a field and pressing "Look up again" refreshes it. Confirming the first place in a city brings up the flamingo's "Create a space for Singapore?" prompt; Yes saves it, No returns to the card. Saved lists each city space with its place count.
  Why now: This is the riskiest step in the whole build: two outside services (Gemini and Google Places) must return what the spec assumes, and the plan in slice 3 needs real saved places to choose from. Finding a wrong model name or a Places field problem now is cheap.
  PRD ref: `prd.md > Saving a Place` (first three criteria), `prd.md > City Spaces`
  Spec ref: `spec.md > Components > Add: Save a Post`, `spec.md > Components > City Spaces`, `spec.md > Server Routes` (`/api/identify`, `/api/lookup`, `/api/places`), `spec.md > AI Prompts`, `spec.md > External Services and Dependencies > Gemini API`, `spec.md > External Services and Dependencies > Google Maps Platform`
  Build: `lib/gemini.ts` (ask Gemini, get typed JSON), `lib/prompts.ts` (IDENTIFY and ENRICH), `lib/maps.ts` (text search and place details), the three routes, `/add` with the Save a post form, `ConfirmCard`, `SpacePrompt`, a first `Flamingo` SVG, `/saved`, and `EstimateChip`. Confirm the exact Gemini model name against the live model list first.
  Verify (mechanical): A script lists available Gemini models and confirms the chosen Flash-Lite name; `curl` to `/api/identify` with a real Singapore caption returns the expected place with a Google place ID, hours and rating; `/api/places` writes a space and a place row; a second place in the same city reuses the space; `npm run build` passes.
  Learner check: On Add, paste a real Instagram post link and caption for a place you know, check the card is right, fix a field if needed, create the Singapore space, then open Saved and see Singapore with 1 place. Try a screenshot of a second post too.
  Commit: `Save a post as a place with Gemini and Google Places`

- [x] **3. The flamingo plans your day using only your saved places**
  Becomes usable: On Plan, typing "a casual lunch with friends and a cozy dinner in Singapore" returns one stop per part of the request, each from your saves, with a suggested time, today's hours (warned if closed), the AI busy estimate, cost per person, and travel time between stops. A request with no match says "Not found on your list"; a request with no city gets asked which city. A demo account filled with real Singapore places exists for planning and for judges.
  Why now: This is the unique kernel. It comes straight after saving, so the core promise ("saved places become plans") is proven while there is still time to tune it, before any of the browsing polish.
  PRD ref: `prd.md > Planning With the Flamingo` (all criteria except the rest-of-day follow-up), `prd.md > Profile` (demo account)
  Spec ref: `spec.md > Components > Plan With the Flamingo`, `spec.md > Server Routes > POST /api/plan`, `spec.md > AI Prompts`, `spec.md > External Services and Dependencies > Google Maps Platform` (Compute Route Matrix), `spec.md > What Was Simplified and Why` (demo data)
  Build: PLAN prompt; `/api/plan` with the city step, the saved-places list, the placeId guard, the opening-hours check, and the route matrix (transit, falling back to driving); `plans` insert; `/plan` chat page with `ChatBubble` and `PlanStop`; `scripts/seed-demo.ts` to create the demo account with about ten real Singapore places.
  Verify (mechanical): Seed script runs and the demo account has its places; `curl` to `/api/plan` for the two-part request returns two stops whose IDs are all in the user's saves, with travel minutes; a request for something not saved returns "Not found on your list"; a request with no city returns the city question; a hand-built test confirms the guard drops an ID that isn't in the list; `npm run build` passes.
  Learner check: Sign in to the demo account, open Plan, and ask for a casual lunch and a cozy dinner in Singapore. Check that both stops are places in Saved, the times make sense, and the travel time shows. Then ask for something you never saved, such as "a ski slope in Singapore".
  Commit: `Plan a day with the flamingo from saved places only`

- [x] **4. You can browse a city on a map and open a place's details**
  Becomes usable: Tapping a city space in Saved opens City View: a Google map centred on the city with a pin for every saved place, plus a list. Tapping a pin, a list entry, or a plan stop opens Place Details with name, type, area, hours for today and the week, the labelled busy estimate, cost per person, rating and review count, the original post link, and visited status. Missing facts show "Not available".
  Why now: With saving and planning working, this makes saved places browsable and gives plan stops somewhere to link. It needs no new external calls beyond the browser map, so it is low risk.
  PRD ref: `prd.md > City View and Place Details`, `prd.md > States and Boundaries` (missing map data)
  Spec ref: `spec.md > Components > City View`, `spec.md > Components > Place Details`, `spec.md > External Services and Dependencies > Google Maps Platform` (Maps JavaScript)
  Build: `CityMap` with `@vis.gl/react-google-maps` and the browser key, `PlaceList`, `PlaceCard`, `/city/[spaceId]`, `/place/[placeId]`, and links from Saved and `PlanStop`.
  Verify (mechanical): `npm run build` passes; with the dev server running, `/city/[id]` for the demo Singapore space returns the right number of places and `/place/[id]` renders every field or "Not available"; a place belonging to another user returns not found.
  Learner check: From Saved, open Singapore, count the pins against the list, tap one, and check its details against Google Maps. Tap the post link to make sure it opens the original post.
  Commit: `Add City View map and Place Details`

- [x] **5. Home shows your cities on a world map and the flamingo flies there**
  Becomes usable: Home shows the flat world map with a dot for each of your city spaces and the flamingo waiting. Searching "Singapore" sends the flamingo flying to its dot, then opens City View. Searching a city you haven't saved makes the flamingo say so with a shortcut to Add. A first-time user sees the flamingo inviting them to save a first place. A shortcut to Memories sits on Home.
  Why now: It is the app's front door and the flamingo's personality moment, but it only displays data the earlier slices already create, so it can safely come after the kernel. The flight animation is the second item on the cut list.
  PRD ref: `prd.md > Home and City Search`, `prd.md > States and Boundaries` (first use)
  Spec ref: `spec.md > Components > Home and World Map`, `spec.md > Look and Feel` (world map, flamingo)
  Build: Public-domain world map SVG in `public/`, `lib/geo.ts` (lat/lng to map x/y), `WorldMap` with city dots, flamingo poses (waiting, talking, flying) and the CSS flight, the search box filtering the user's spaces, and the empty-state invitation.
  Verify (mechanical): `npm run build` passes; a check of `lib/geo.ts` places Singapore, London and New York dots in the right regions of the map; Home renders with zero spaces and with the demo account's spaces.
  Learner check: On Home, search "Singapore" and watch the flamingo fly before City View opens. Then search a city you have no saves in and check what the flamingo says.
  Commit: `Add world map Home with city search and flamingo flight`

- [x] **6. Tricky posts, the rest of the day, and a live app for judges**
  Becomes usable: A post the AI can't identify asks for comments, then the flamingo's short questions, and can still be saved. After a plan, the flamingo offers to fill the rest of the day and extends it from other saves. Profile shows places saved, cities and places visited. If Gemini's free quota runs out, the flamingo says it needs a short rest instead of breaking. The app is live on Vercel from a public GitHub repo, with a README describing the demo account.
  Why now: These are the edges around the working core. The rest-of-day follow-up is the third item on the cut list, so it sits after the main journey. Going live here leaves time to fix deployment surprises before the deadline.
  PRD ref: `prd.md > Saving a Place` (fallback criterion), `prd.md > Planning With the Flamingo` (rest-of-day criterion), `prd.md > Profile` (counts, other device), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Add: Save a Post` (fallback path), `spec.md > Server Routes > POST /api/identify`, `spec.md > Server Routes > POST /api/plan`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > External Services and Dependencies > Vercel`
  Build: the comments and questions flow on Add; the follow-up turn in `/api/plan` and on `/plan`; Profile counts; a shared handler for Gemini's 429 error; `README.md`; GitHub repo and Vercel project with the environment variables (Krishna creates the repo and imports it, with guidance).
  Verify (mechanical): `curl` to `/api/identify` with a caption that names no place returns `needs: "comments"`, then `needs: "questions"`; a two-turn plan conversation adds stops on "yes"; a simulated 429 returns the rest message; `npm run build` passes; the live Vercel URL loads `/login` and signs in to the demo account.
  Learner check: On the live URL, sign in to the demo account on your phone, plan a lunch, say yes to the rest of the day, and check Profile's counts. Then try saving a post whose caption doesn't name the place.
  Commit: `Add fallback questions, rest-of-day plans, profile counts and deployment`

- [x] **7. Your outing photos become Memories on the places you visited**
  Becomes usable: On Add > Add photos, dropping in photos from an outing reads each photo's location and date, matches it to a saved place within 200 metres, shrinks and uploads it, and marks the place visited. Unmatched photos can be attached by hand or skipped. Memories shows photos grouped by place and date, and each place's photos appear on its Place Details.
  Why now: Built last because it is the first thing to drop if time runs short, and nothing else depends on it.
  PRD ref: `prd.md > Memories`
  Spec ref: `spec.md > Components > Memories`, `spec.md > Data Model` (photos, storage), `spec.md > Important Failure Modes` (photo with no location)
  Build: `lib/photos.ts` (exifr read before compression, nearest place within 200 m, browser-image-compression, upload to the private bucket, signed links), `PhotoDrop`, the Add photos tab with the Unmatched list, `/memories`, and photos on Place Details.
  Verify (mechanical): A test of the nearest-place function matches a coordinate 50 m from a saved place and rejects one 500 m away; uploading a photo with GPS data writes a `photos` row and sets `visited`; the stored file is under about 250 KB; another user cannot read it; `npm run build` passes.
  Learner check: Take or pick a photo with location turned on from somewhere you've saved, add it under Add photos, and find it in Memories and on that place's details. Try a screenshot too and check it lands in Unmatched.
  Commit: `Add photo matching and Memories`

## Hands-on Checkpoints

- [x] Early usable behavior explored: after slice 3, Krishna saves his own posts and plans a day with them, so feedback on saving and planning can still shape slices 4 to 7
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Photos: choose one place for a whole batch before dropping (Krishna: picking a place per photo was a hassle) — verified two location-less photos both filed under the chosen place
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Added an `area` column to places (`002_place_area.sql`) — the PRD shows each place's area, but the first schema had no field for it.
- Load `@google/genai` outside the Next.js bundle (`serverExternalPackages`) — when bundled, Gemini ignored the JSON reply format inside routes, though it worked in plain Node.
- Turned off Next.js 16 Cache Components — every page shows one user's own data, so prerendering added complexity without benefit.
- City for a plan is matched against the user's own space names instead of a separate Gemini call — saves free-tier quota and gives the same "which city?" behaviour.
- Transit times use the planned time of day — at night, "leave now" transit times were nearly double.
- Save a post is now link or screenshots (up to 4 reel frames), with caption and comments optional, and unclear posts go straight to the flamingo's questions — Krishna's checkpoint feedback: many creators show the place only in the video, so a required caption made saving harder. The questions flow moved forward from slice 6; Google lookups now include the branch or area so chains match the right outlet.
- Home became a full-screen colourful world map with a big serif "Where to next…" search (mymind-inspired), pins drawn inside the map, and a zoomed view on phones — Krishna's feedback that the first version worked but looked bland.
- Colour pass on every page (pastel header bands with serif titles, colour washes, gradient cards) — Krishna's feedback that the other pages looked bland next to the new Home.
- Added `vercel.json` naming the framework — the Vercel project was created before the code existed, so it defaulted to a static site and failed looking for a `public` output folder. Live at https://scroll-scrape.vercel.app.
- Photo metadata is read with exifr's full GPS parse — picking only latitude/longitude fields silently skipped the step that computes them, so every photo came out "no location" until a test photo caught it.
