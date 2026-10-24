---
doc: prd
status: approved
---

# Scroll Scrape: Product Requirements

| | |
|---|---|
| **Project** | Scroll Scrape |
| **Author** | Krishna (solo) |
| **Event** | Devpost Learn, Build With AI: Basics |
| **Document** | Product requirements, the second of three planning documents (scope, PRD, spec) |
| **Date** | 24 October 2026 |
| **Status** | Approved |

**Summary.** Scroll Scrape is a web app that turns places saved from social media into plans. Users save restaurants, cafés, parks and activity spots from Instagram posts. The AI groups them into a space for each city, and a flamingo guide plans outings using only those saved places. Photos from an outing are then matched back to the places visited.

Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey

1. **Arrive.** The user opens Scroll Scrape and lands on **Home**: a flat illustration of the Earth with the flamingo waiting, a city search bar at the top and a dock of five buttons at the bottom.
2. **Save a place.** The user taps **Add**, chooses *Save a post*, and pastes an Instagram post link together with its caption, or drops in a screenshot of the post. The AI identifies the place and its city and shows a confirmation card. The user confirms or corrects it.
3. **Create a city space.** If this is the user's first place in that city, the flamingo asks: *"You don't have a space for Singapore yet. Shall I create one?"* On approval, the space is created and the place is saved into it.
4. **Browse.** From Home, the user searches for a city. The flamingo flies to that city and the **City View** opens: a map with a pin for every saved place, alongside a list. Tapping a place opens **Place Details**: hours, busy times, cost per person, rating, and a link back to the original post.
5. **Plan.** The user taps **Plan**, and the flamingo asks what they would like to do. The user describes it in plain words, for example *"a casual lunch with friends and a cozy, romantic dinner in Singapore."* The flamingo returns one stop for each part of the request, chosen only from the user's saved places in that city, and then offers to fill the rest of the day.
6. **Remember.** After the outing, the user taps **Add**, chooses *Add photos*, and drops in photos from the day. Each photo is matched to a saved place by its location and date. The place is marked as visited and the photos appear in **Memories**.

**Success:** a pile of unrelated saved posts becomes a plan for the day built entirely from the user's own places (`scope.md > What "Working" Looks Like`).

## Screens and Layout

A **bottom dock** with five buttons is visible on every main screen and is the only navigation the user needs:

| Dock button | Screen | Purpose |
|---|---|---|
| Home | Home | Earth illustration, flamingo, city search, shortcut to Memories |
| Saved | Saved | All city spaces as lists |
| Add | Add | Save a post, or add photos from a visit |
| Plan | Plan | Talk to the flamingo to plan a day |
| Profile | Profile | The user's details and saved spots |

Screens reached from these:

- **City View**, from a Home search or by tapping a city space in Saved: a map of the city with pins for saved places, plus a list of the same places.
- **Place Details**, from a pin, a list item or a plan stop.
- **Memories**, from the shortcut on Home: photos from visits, grouped by place.

## Look and Feel

- **Theme:** light, not dark.
- **References:** a blend of **ReciMe** (saved items shown as clean, photo-led cards) and **mymind** (calm, uncluttered, plenty of white space).
- **Mascot:** a **flamingo** that appears on Home, flies to the searched city, and does the talking on Plan.
- **Colour:** bright, but from a small palette with few shades.
- **Mood:** easy, cozy and casual.
- **Navigation:** simple and obvious; the bottom dock is always there.
- **Avoid:** dark themes, many competing colours, crowded screens.

## Features and Behavior

### Saving a Place
Source: `scope.md > The Core Loop` (Save), `scope.md > The POC Boundary` (Place capture).

The Add screen offers two options: **Save a post** and **Add photos** (see *Memories*). Under *Save a post*, the user pastes the post link and its caption, and may also paste comments from under the post. Alternatively, they drop in a screenshot of the post. Scroll Scrape reads only what the user provides; it does not open the post itself (`scope.md > Explicitly Cut`).

The AI identifies the place name, the type of place (for example bowling alley, Italian restaurant, café) and the city. A confirmation card shows these with the place's address from map data and the post link. The user confirms or edits any field before saving.

If the AI cannot identify the place from the caption, the flamingo asks the user to paste comments from the post or add a screenshot of them. If that still isn't enough, the flamingo asks a few short questions (the place's name, the city or area, the type of place) and then shows the confirmation card.

- As someone who saves places from Instagram, I want to save a post in a few seconds so that it isn't lost in my saved folders.
  - [ ] Pasting the link and caption of a real Instagram post that names a place shows a confirmation card with the correct place name, type and city.
  - [ ] Dropping in a screenshot of the same post produces the same confirmation card.
  - [ ] Editing a field on the card and confirming saves the edited version.
  - [ ] A post the AI cannot identify leads to a request for comments, then to the flamingo's questions, and the place can still be saved.

### City Spaces
Source: `scope.md > The Core Loop` (Save).

Every saved place belongs to a space for its city. Spaces are created by the AI, but only with the user's permission.

- [ ] Saving the first place in a new city shows the flamingo's prompt to create a space for that city.
- [ ] Approving creates the space, and the place appears in it in Saved and on the City View map.
- [ ] Declining creates no space and does not save the place; the user returns to the confirmation card to change the city or cancel.
- [ ] Saving a second place in the same city adds it to the existing space without asking again.
- [ ] The Saved screen lists every city space with its name and number of places; tapping one opens its City View.

### Home and City Search
Home shows a flat illustration of the Earth, the flamingo waiting, a search bar at the top and a shortcut to Memories.

- [ ] Searching for a city that has a space plays a short animation of the flamingo flying to that city, then opens its City View.
- [ ] Searching for a city with no saved places shows the flamingo saying the user hasn't saved anything there yet, with a shortcut to Add.
- [ ] If the flying animation cannot be completed in time, a simple transition to City View is an acceptable fallback.

### City View and Place Details
Source: `scope.md > The POC Boundary` (Saved places list).

City View shows the city's map with a pin for each saved place, like searching for convenience stores on Google Maps, and a list of the same places.

Place Details shows:
- name, type of place and area;
- opening and closing hours, from real map data;
- when it is usually busy, **labelled as an AI estimate**;
- approximate cost per person;
- rating from other reviewers, from map data;
- a link to the original social media post;
- whether the user has visited, with their photos if any.

- [ ] Every saved place in the city appears as a pin on the map and as an entry in the list.
- [ ] Tapping a pin or list entry opens that place's details with all the fields above.
- [ ] The busy-times information is visibly labelled as an estimate.
- [ ] The post link opens the original post.

### Planning With the Flamingo
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop` (Ask, Plan).

On Plan, the flamingo greets the user and asks what they would like to do. The user replies in plain words. The shape of the plan depends on the request: one stop for a single meal, or several stops for a day, each matched to its purpose (for example *Casual lunch with friends*, *Cozy dinner*).

The AI considers only the user's saved places in the requested city. It ranks matches by distance, price, waiting time and crowd level, reviewer rating, and whether the place is open at that time. Each stop in the plan shows its purpose, a suggested time, opening hours, the AI crowd estimate (labelled), cost per person, and travel time from the previous stop. Each stop links to its Place Details. After presenting the plan, the flamingo asks whether the user would like suggestions for the rest of the day, and extends the plan from other saved places if so.

If nothing saved matches, the flamingo replies **"Not found on your list."** It never suggests a place the user has not saved.

- As someone with plenty of saved places, I want to describe my day and get a plan from places I already chose so that I actually go to them.
  - [ ] "Lunch in Singapore, pasta or pizza", with at least one saved pizza or pasta place in Singapore, returns that place with its hours, crowd estimate and cost.
  - [ ] "A casual lunch with friends and a cozy, romantic dinner in Singapore" returns two stops, each from the user's saves, with suggested times and travel time between them.
  - [ ] After the plan, the flamingo asks about the rest of the day, and answering it adds further saved places to the plan.
  - [ ] A request with no matching saves returns "Not found on your list."
  - [ ] Every place in any plan can be found in the user's Saved screen.
  - [ ] A request that names no city prompts the flamingo to ask which city.

### Memories
Source: `scope.md > The Core Loop` (Remember), `scope.md > The POC Boundary` (Photobook, built last).

Under Add > *Add photos*, the user drops in photos from an outing. Scroll Scrape reads each photo's location and date and attaches it to the matching saved place. That place is marked as visited. Memories shows the photos grouped by place and date, and each place's photos also appear on its Place Details.

- [ ] A photo taken at a saved place appears under that place in Memories and on its Place Details.
- [ ] That place is shown as visited.
- [ ] A photo with no location, or taken away from any saved place, is listed as unmatched, and the user can attach it to a place by hand or skip it.

This is the last feature built and the first to be dropped if time runs short.

### Profile
The Profile screen shows the user's username, email and saved spots, and lets them sign out. Each user **signs up and signs in with their email, a password and a username**, so every person has their own private spaces that are kept safely online. A **demo account**, already filled with sample places, is provided for judges.

- [ ] A new visitor can create an account with email, password and username, and lands on an empty Home.
- [ ] Signing in on another device shows the same spaces and places.
- [ ] One user never sees another user's places.
- [ ] Signing in to the demo account shows its sample places, ready to plan with.

- [ ] Profile shows the user's name, the number of places saved, cities, and places visited.

## States and Boundaries

- **First use.** No spaces exist. Home shows the flamingo inviting the user to save a first place, with a shortcut to Add. Saved shows the same invitation. Plan replies that there is nothing saved yet.
- **Unidentifiable post.** Handled as described under *Saving a Place*: comments, then questions.
- **City with no saves.** Handled as described under *Home and City Search*.
- **No match for a plan.** "Not found on your list." When a request has several parts, the parts that do match are still planned.
- **Missing map data.** If a place's hours or rating are unavailable, Place Details and plan stops show "Not available" rather than a guess.
- **What persists.** Saved places, city spaces, plans the user has seen, and photos remain when the user closes the app and comes back.
- **Location.** Ranking by distance uses the user's location only if they allow it (see *Product Decisions*, assumptions).

## Product Decisions

Decisions made by Krishna during the interview:

- **City spaces, created with permission.** The AI groups saves by city, but asks before creating a new space, to keep the user in control as with confirming a place.
- **Sign-in with email, password and username, built now** (revised 24 October 2026 during `4-spec`). Krishna chose this over browser-only storage so that data is kept safely online and each user has their own account. A demo account serves judges. Extra details such as phone numbers were left out to keep it simple.
- **Five-button bottom dock** (Home, Saved, Add, Plan, Profile), to make navigation easy.
- **A flamingo mascot** guides the user on Home and Plan, giving the app personality and a cozy feel.
- **A flat Earth illustration instead of a rotating 3D globe**, because the globe would be hard to build in the time available.
- **Plans come only from saved places.** If nothing matches, the app says so rather than searching elsewhere. This is the product's main difference from search engines.
- **The plan's shape follows the request** (one stop or several), followed by an offer to plan the rest of the day.
- **No separate budget feature**, because it would complicate the build; budget words in the request are still understood.
- **Photos are added from the Add screen**, alongside saving posts.
- **Fallback for unidentified posts:** comments first, then the flamingo's questions.
- **Light, cozy look** inspired by ReciMe and mymind.

Assumptions written into this draft, to confirm:

- *Assumption:* declining a new city space returns the user to the confirmation card without saving.
- *Assumption:* ranking by distance uses the user's location when they allow it; otherwise it uses travel time between stops.
- *Assumption:* the photo area is called **Memories**. Krishna's working name was "MySpace", which is the name of an existing social network and could conflict with the video rules on trademarks.

## What We're Building

1. Bottom dock with Home, Saved, Add, Plan and Profile.
2. Saving a place from a link plus caption (and optional comments) or a screenshot, with AI identification, confirmation, and the fallback questions.
3. City spaces created with permission, and the Saved screen.
4. Home with Earth illustration, flamingo, city search and the flying animation (simple transition as fallback).
5. City View map with pins and list; Place Details with real hours and ratings and a labelled crowd estimate.
6. Planning with the flamingo, from saved places only, with "Not found on your list" and the rest-of-day follow-up.
7. Memories: photos matched by location and date, places marked visited (built last).
8. Sign-up and sign-in (email, password, username), a Profile screen, and a demo account with sample places.

## Deferred From the POC

| Item | Why it is deferred |
|---|---|
| Rotating 3D globe | Replaced by the flat Earth illustration; too costly for the time available. |
| Separate budget feature | Adds complexity; budget words in a request already cover the demo. |
| Searching for places the user hasn't saved | Scraping Google Maps would break Google's terms, and it blurs the "only your saves" difference. A later version could use official map data. |
| Reading a post's comments automatically | The app cannot open Instagram posts; the user pastes comments instead (`scope.md > Explicitly Cut`). |

## Possible Later Enhancements

- **Nearby suggestions** from official map data when nothing saved matches, clearly separated from the user's own saves.
- **One-tap saving from Instagram's share menu,** in a native app (`scope.md > Later`).
- **Reading a reel's audio** when the caption doesn't name the place.
- **Sharing a plan with friends.**
- **Recipe spaces** using the same engine.

## Non-Goals

- **No automatic import of Instagram saved folders:** Instagram does not allow it.
- **No live crowd data:** no official live source exists; busy times are a labelled estimate.
- **No re-hosting of a post's images or video:** the app keeps the link and place details only.
- **No suggestions from outside the user's saves in the proof of concept:** this is the product's identity.
- **No dark theme.**

## Open Questions

Resolved at approval (24 October 2026): nearby suggestions beyond saves kept as a later enhancement. Sign-in was first deferred, then brought into the build the same day during `4-spec`.

1. **Name of the photo area** ("Memories" or another name). *Can wait until the build.*
