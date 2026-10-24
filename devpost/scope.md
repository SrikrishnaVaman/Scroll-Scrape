---
doc: scope
status: approved
---

# Scroll Scrape: Project Scope

| | |
|---|---|
| **Project** | Scroll Scrape |
| **Author** | Krishna (solo) |
| **Event** | Devpost Learn, Build With AI: Basics |
| **Document** | Scope, the first of three planning documents (scope, PRD, spec) |
| **Date** | 21 October 2026 |
| **Status** | Approved |

**Summary.** Scroll Scrape is a personal space for places discovered on social media. Users save restaurants, parks, arcades and other venues from Instagram posts. On request, an AI planner turns those saved places into a practical, timed itinerary. After the outing, the user's own photos are organised into a photobook of the places visited.

## The Unique Kernel
**Saved places become plans.** Existing save-for-later features, including Instagram's own collections, stop at storage. Scroll Scrape's AI builds an itinerary using only the places the user has personally saved. Stops are ordered by real opening hours and travel time and fitted to the user's stated preferences for the day. The product moves the user from "saved" to "here is your Saturday."

## Who It's For
**Primary user:** young adults anywhere in the world who regularly save hangout spots from Instagram (restaurants, cafés, parks, arcades and game zones) with the intention of visiting them later with friends. The proof of concept is demonstrated in Singapore, where the author lives, but nothing in the design is tied to one city.

**The problem today:** when it is time to make plans, these saves are hard to use. Users scroll back through saved folders, take screenshots, or rebuild plans from memory. In the author's experience, Instagram's saved collections also have a limit, and he lost saved folders after exceeding it.

## The Core Loop
1. **Save.** The user finds a place on Instagram and adds it to Scroll Scrape by pasting the post link together with its caption or a screenshot of the post. AI identifies the place, and the user confirms or corrects it before it is saved. There is no limit on saves.
2. **Ask.** When planning an outing, the user describes what they want, for example "a relaxed Saturday, affordable food, close to public transport."
3. **Plan.** Scroll Scrape returns an itinerary drawn from the user's saved places. Stops are ordered, with opening hours, travel time between stops and an AI estimate of how busy each place usually is.
4. **Remember.** After the outing, the user adds photos. Each photo is matched to a visited place using its location and date, and a photobook is assembled.

Users return whenever they discover a new place or need a plan.

## Inspiration & Identity
- A personal space where saved places belong to the user and are not lost to a platform's limits.
- Planning should feel effortless: one request, one clear plan.
- Reference: ReciMe, a recipe app that reads Instagram captions to build a cookbook and lets the user correct the result. Scroll Scrape applies the same "AI reads it, the user confirms it" pattern to places.

## Why This Matters to the Learner
The idea comes from the author's own loss of saved Instagram folders. Through this project he aims to improve at coding, prototyping and shipping. He will personally own the design of the data flow, the front-end and back-end structure, and the core concept.

## What "Working" Looks Like
The proof of concept is complete when a demo video under three minutes, presented by the author, shows the following end to end:
1. **The problem:** the backstory of hitting Instagram's saved-folder limit and losing saves.
2. **Save:** an Instagram post about a place is saved to Scroll Scrape, and the identified place is confirmed.
3. **Plan:** with several places saved, a preference is entered and an itinerary is produced from those saves, with real opening hours and travel times.
4. **Remember:** photos from an outing are added and appear against the correct places in a photobook.

**Key demo moment:** a collection of unrelated saved posts becomes one ordered, timed plan for the day.

## The POC Boundary
In scope for the proof of concept:
- **Place capture:** save a place from a pasted link plus caption or screenshot. AI identifies the place, and the user confirms or corrects it.
- **Saved places list:** view all saved places.
- **AI itinerary:** generated from saved places using the user's preference input, real opening hours and real travel times. Includes an AI crowd estimate, clearly labelled as an estimate.
- **Photobook (built last):** user-selected photos are matched to saved places by embedded location and date, and matched places are marked as visited.

## Later
- **Recipe vault:** AI sorts saved recipes by difficulty, cuisine and number of ingredients, with a shopping list and steps.
- **One-tap saving from Instagram's share menu,** with the app retrieving the post itself (as ReciMe does). Requires a native mobile app and permitted access to post content.
- **Place extraction from a reel's audio** when the caption does not name the place.
- **Additional platforms** (for example TikTok) and content types.
- **Backup and export** of the user's vault.
- **Sharing** a plan with friends.

## Explicitly Cut
| Item | Reason |
|---|---|
| Automatic import of Instagram saved folders | Instagram does not allow outside apps to read a user's saves; places are added by pasting a link instead. |
| Automatic scanning of the phone's photo library | Requires a native mobile app; the user selects photos instead. |
| Live crowd data | No official live source is available to apps; replaced by a clearly labelled AI estimate. |
| Downloading and re-hosting a post's video or images | Likely conflicts with platform terms; Scroll Scrape stores the link and place details, not the media. |
| Late-night food finder, cab fare comparison, budget coach, group-chat planner | Alternative ideas explored during scoping and set aside in favour of this concept. |

## Alignment with Judging Criteria
- **Design:** one coherent journey (save, plan, remember) rather than a set of disconnected features.
- **Potential Impact:** a specific, first-hand problem (lost and unusable saved places) for a clearly defined audience.
- **Innovation:** goes beyond storing saves by turning them into a timed, preference-aware itinerary built only from the user's own saves.
- **Presentation:** a short, linear demo with a clear before-and-after moment.
