# GeauxTravel frontend

This is the React and TypeScript starting point for the website. The home page introduces GeauxTravel, and the navigation opens a login UI.

## Run it

Use Node.js 24 LTS. The tests use Node's built-in TypeScript support and test runner; no test framework is installed.

```sh
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite. Home uses `#/` and login uses `#/login`, so the login view can be opened directly or reloaded without a server rewrite. Browser Back and Forward switch between the views. Unknown hashes show home.

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
