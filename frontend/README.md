# GeauxTravel frontend

This is the React and TypeScript frontend for GeauxTravel. The home page shows an interactive map and destination ideas, with links to trip preferences and login.

## Home page

The home page uses the cream and purple design with a map. Explore destination ideas jumps to three places with expandable suggestions. The ideas are static; they do not fetch availability or create an itinerary. Plan a trip opens the trip-preference form. Backend connections are still separate work.

## Run it

Use Node.js 24 LTS. The tests use Node's built-in TypeScript support and test runner; no test framework is installed.

```sh
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite. Home uses `#/`, login uses `#/login`, and trip preferences use `#/preferences`. Each view can be opened directly or reloaded without a server rewrite. Browser Back and Forward switch between the views. Unknown hashes show home.

## Check it

```sh
npm test
npm run lint
npm run build
```

The dependency-free tests cover hash resolution and local login field validation. Browser review is needed for the responsive menu, current-page indication, direct login URL, Back and Forward, keyboard focus, field errors, password visibility, and the sign-in notice.

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
home, preferences, and login. Reloading the page clears the draft. Nothing
is saved to an account or sent to the Java backend, and the form does not
generate an itinerary yet. Clear destination removes only the pin and
coordinates, leaving the other fields intact.
`#/map` opens home for links made before the map moved to the homepage.

Mapbox is installed in `frontend`, with the rest of the app dependencies.
The existing public browser token is used by default. Set
`VITE_MAPBOX_TOKEN` in `frontend/.env.local` to use a different public
Mapbox token. Never put a secret token in a `VITE_` variable.
