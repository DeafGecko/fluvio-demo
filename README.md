# Fluvio — a learning project for building a mobile app

Fluvio is a completed demo expense tracker for iPhone (and Android) that I built to learn how to take an app from an idea to working code. Every screen starts as a sketch, becomes a design in Figma, and then gets built in code with React Native and Expo.

Everything in the app is fictional. The banks, accounts, names, and amounts are made up, and no real bank is connected.

## Why I built it

I wanted to learn the whole path, not only the coding part:

1. **Research** — what people need to see about their money, and what confuses them.
2. **Design** — draw the screens in Figma, first as one agreed design, then as a separate review file for changes.
3. **Code** — build each screen in Expo, and check it on the iPhone simulator.
4. **Write it down** — keep notes in Markdown files so I can see what is done, what is not, and why I made each choice.

## What it does

- **Home:** total spent, recent purchases, a demo alert, and a bell with unread notifications.
- **Activity:** every purchase, grouped by date. Tap one to see its details. Swipe left, or tap the ⋯ button, for Edit and Delete. Deleted purchases stay in history and can be restored.
- **Purchase details:** change the category, add a note, or edit the purchase.
- **Accounts:** checking, savings, and a credit card, each with its own screen. Credit card sync is saved on the device.
- **Cash:** take cash out of an account with an optional note, see cash on hand, and edit or delete a withdrawal.
- **Insights:** a pie chart of spending by category, a warning when the same subscription is charged twice in one month, and tips.
- **Statement:** six months of fictional money in and out.
- **Search, bills, and money journey:** search by name, category, or amount; a list of regular bills; and a month-by-month view of money in and out.
- **Notifications:** a list of demo alerts. Opening one marks it read and dims it.
- **Profile and settings:** change your name, turn notifications on, choose light, dark, or system appearance, and use larger text. Hide amounts with one tap, so a screen can be shown to someone without showing the numbers.
- **First-run setup:** a welcome screen, a short tour, a demo profile, and a pretend bank connection.

## How I built it

- **Expo and React Native** with **Expo Router**, so each screen is a file.
- **AsyncStorage** for data on the device. There is no server, so nothing leaves the phone.
- **Design tokens** for colors, spacing, and text sizes, so the light and dark themes stay consistent.
- **Small shared components** for the swipe rows, the saved and error popups, the tab bar, and the first-run screens.
- **Demo data generator:** six months of sample data from a fixed seed, so it looks the same every time.

## Design and documentation

- **Figma:** one file holds the agreed design. A second file holds review frames for changes I made in the app, so the original design is never changed by accident.
- **`docs/FLUVIO-IMPLEMENTATION.md`:** a checklist of what matches the design, what is partly done, and what is not built yet.
- **`docs/FIGMA-UPDATE-PROCESS.md`:** how I move a change from the app to Figma review, and then into the agreed design.

I wrote these files as I went, because I kept forgetting why I made each choice.

## What I learned

- Starting from a design makes the code easier to decide, because most questions are already answered.
- The small stuff takes the most time: spacing, tap targets, and what happens when a list is empty.
- Writing things down helped more than I expected. When I came back after a week, the notes told me where I stopped.
- Some things that look simple, like a swipe row, can crash the app on a new version. I replaced the library with a simple version I could test.

## Running it

You need Node.js, Xcode (for the iPhone simulator), and Expo.

```bash
npm install
npx expo start
```

Press `i` to open the iPhone simulator, or scan the QR code with Expo Go on a phone.

To run the tests and the type check:

```bash
npx vitest run     # unit tests (20 tests)
npx tsc --noEmit   # type check
```

GitHub runs the unit tests and a security audit on every push (`.github/workflows/security.yml`).

## Website demo

The same app runs in a browser. The website shows a landing page with the Fluvio name, a short description, Mobile and Tablet buttons, and a QR code. The app appears in a phone frame next to it, and on phones the frame sits under the text.

- **Live site:** [fluvio-demo.netlify.app](https://fluvio-demo.netlify.app/)
- **Landing page:** `web-demo/index.html`. The app itself lives at `web-demo/app.html`, and the page inside the phone frame loads `/splash`.
- **Netlify:** `netlify.toml` publishes the `web-demo` folder as-is, with no build command. Netlify reads `web-demo/_headers` (security headers) and `web-demo/_redirects` (routes).
- **Rebuild the web app** after code changes:

  ```bash
  npx expo export --platform web --output-dir /tmp/fluvio-web
  ```

  Then copy `_expo` and `assets` into `web-demo`, and point the script tags in `web-demo/app.html` at the new file names (the names change with each build). Keep `index.html`, `demo.html`, `demo.js`, `boot.js`, `theme-init.js`, `_headers`, and `_redirects`, because the export does not create them.
- **Home screen:** the web app includes a manifest and icons, so a phone can save it to the home screen and open it full screen.
- **Theme:** the app starts in light mode. Settings → Appearance can switch to dark or back to the phone's setting. The page reads that saved choice before it first paints, so the phone does not flash the wrong theme.

## Documentation

The notes in `docs/` stay on this computer. The folder is listed in `.gitignore`, so it is not on GitHub. The main files are `docs/SECURITY-NOTES.md` (what was checked and what is still open) and `docs/FLUVIO-IMPLEMENTATION.md`.

## Limits and known gaps

The demo is complete. These are the known gaps, kept on purpose or left for later:

- Savings goals are not built yet.
- The AI tips feature is switched off. The app no longer calls an AI service directly, so no key ships in the app. Turning it back on needs a server to hold the key.
- Some features only work on iPhone, such as renaming with a prompt.
- Bank connection is pretend. Nothing connects to a real account.
- The GitHub security check fails on the `npm ci` step because of a dependency mismatch in Expo's dev tools (`@expo/ws-tunnel` needs `ws` 8, but the lockfile pins 7). The Netlify site is not affected.
- Data is stored unencrypted on the device. This is accepted for a demo with fictional data only.
