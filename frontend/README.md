# GeauxTravel frontend

This is the React and TypeScript frontend for GeauxTravel. The home page shows an interactive map and destination ideas, with connected trip preferences, example itineraries, saved trips, account forms, review drafts, and flight quote comparison.

## Home page

The home page uses the cream and purple design with a map. Explore destination ideas jumps to three places with expandable suggestions. Plan a trip opens the trip-preference form. New visitors can open the account-creation form or continue planning as guests. Backend connections are still separate work.

## Run it

Use Node.js 24 LTS. The tests use Node's built-in TypeScript support and test runner; no test framework is installed.

```sh
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite. Routes are `#/`, `#/login`, `#/signup`, `#/preferences`, `#/itinerary`, `#/trips`, `#/review`, and `#/flights`. Each view can be opened directly without a server rewrite. Browser Back and Forward switch between the views. Unknown hashes show home. An itinerary direct link without a loaded plan shows an empty state; reopen a saved plan from My trips after a reload.

## Check it

```sh
npm test
npm run lint
npm run build
```

The dependency-free tests cover routes, form validation, real calendar dates, example plan generation, independent snapshots, saved-data validation and failures, exact money amounts, and comparable flight quotes. Browser review covers the responsive menu, direct links, Back and Forward, keyboard focus, field errors, password visibility, generation, save/open/delete, review drafts, and quote comparison.

## Login UI status

Account sign-in is not connected to an authentication service. Submitting checks required fields and a basic email format locally, then explains that the user is still signed out. The app does not send or persist the entered email or password. It does not create an account or authenticate a user. Password validation only checks for a nonblank value; an account password policy is not defined here.

The Java work is still in the repository root and is separate from this frontend folder.

## Map and trip preferences

The home page includes the Mapbox map from Mackenzie's map feature. The
map supports pan, zoom, rotation, and keyboard controls. If the map cannot
load, the page shows a message and still links to trip preferences.

Click the map to place a destination pin. Keyboard users can move the map
with the arrow keys and choose Use map center. Plan a trip here carries
the selected latitude and longitude into `#/preferences`; location names
and address search are not connected.

The destination and form fields stay in the draft while moving between
pages. Reloading the page clears that unsaved draft. The example itinerary
uses a separate snapshot, so later preference edits do not change a saved
plan. Clear destination removes only the pin and coordinates, leaving the
other fields intact.
`#/map` opens home for links made before the map moved to the homepage.

Mapbox is installed in `frontend`, with the rest of the app dependencies.
The existing public browser token is used by default. Set
`VITE_MAPBOX_TOKEN` in `frontend/.env.local` to use a different public
Mapbox token. Never put a secret token in a `VITE_` variable.

## Issue 2 pages

- **Example itinerary:** Valid preferences create a randomized set of general activity ideas for 1–31 inclusive calendar days. Interests influence the ideas and pace controls the number per day. These are examples, not venue recommendations, verified prices, opening times, reservations, or a promise that the trip fits the budget. Regenerate uses the displayed plan's snapshot. Edit preferences changes the current draft; preview again to make a new plan.
- **My trips:** Save explicitly to this browser's local storage, up to 20 plans. Saved plans can be opened and deleted after reload. They are not private account records or cloud backups. Other people using the same browser profile can see them. Invalid or unsupported saved data blocks saving until the user explicitly clears it. Failed writes are reported without a success message.
- **Create an account:** Checks email, a nonblank password and matching confirmation locally. No account is created, no credentials are sent or saved, and the visitor remains signed out. The password fields clear after successful checks.
- **Review:** Validates a trip name, rating from 1–5 and up to 2,000 characters of text. The draft stays during this visit, including route changes, and clears on reload. It is not submitted or published.
- **Flights:** Compare manually entered quotes for the same airports, dates, trip type and currency. Enter the total per traveler including fees, and use the same whole-journey basis for duration and stops. Sort by price or duration. Quotes stay for this visit and clear on reload. No live flight search or booking is connected.

## Backend handoff

This change adds no Java routes. The current checkout has no browser-callable account, itinerary, review, saved-trip, or flight endpoint. The frontend uses latitude/longitude and string form values; the Java preferences model uses `budgetPerTraveler` as a decimal and `travelers` as an integer. Agree the HTTP and authentication contracts before wiring those services. Keep provider secrets on the server. Browser-only saved plans and unsent reviews must not be presented as account data or successful server submissions.
