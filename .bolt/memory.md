# Project memory

## Product intent & audience

- FoodLoop: responsive food-tech web app connecting donors, NGOs, and volunteers to redistribute surplus food.
- Three primary user roles: Donor, NGO, Volunteer — each with a distinct registration path.
- Core features: role-based dashboards, listing management, basic matching logic.
- Homepage anchors: Home, About, How It Works, Features, Impact, Get Started (role-selection section).

## Brand personality & voice

- Production-grade, polished, non-generic aesthetic — explicitly "not cookie cutter."
- Food-tech with a social-impact angle; tone should feel purposeful and trustworthy.

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons. No extra UI/icon packages.
- Imports use `@/` alias mapped to `src/`.
- Sticky/fixed navbar is 64px tall; sections use `scroll-margin-top: 4rem` (64px) so headings aren't hidden after smooth-scroll.
- Responsive: distinct desktop and mobile navigation menus; mobile menu is a slide/panel pattern.
- Smooth-scroll to in-page sections via `scrollIntoView({ behavior: 'smooth' })`; active nav link reflects current scroll position (`activeSection` state).
- Footer mirrors main nav links and also scrolls to homepage sections.
- Preserve existing colors, logo, content, and features — do not redesign when fixing bugs.
- Chatbot: custom FoodLoop-branded floating launcher ("Ask FoodLoop") positioned bottom-right; chat panel opens above the launcher. Botpress default floating button hidden via CSS. Loading indicator and error handling retained.

## Decisions, constraints & rationale

- SPA navigation managed via `page` state (e.g. `'home'`, `'register'`) plus `scrollTarget` state for in-page section scrolling.
- Replaced ref-based pending-scroll queue with `scrollTarget` state so scroll fires even when `page` is already `'home'` (ref approach failed because no re-render occurred).
- "Get Started" scrolls to the homepage role-selection section (`#get-started`) rather than going directly to the register form; role cards then link to `/register`.
- CTA buttons inside sections that call `onNavigate('register')` remain direct registration links (intentional CTAs, not nav links).
- `.bolt/prompt` contains authoritative global UI/build instructions; not duplicated here.
- Botpress webchat replaced with official v5.0 embed scripts: `cdn.botpress.cloud/webchat/v5.0/inject.js` + config bundle script (`files.bpcontent.cloud/.../7UTB7E09.js`, loaded with `defer`). Config bundle contains the Client ID and calls `window.botpress.init()` — removed old hardcoded bot ID and manual `init()` call.

## Open questions & assumptions

- Actual registration flow and dashboard implementations are not yet detailed in observed context.
- Backend/persistence and matching algorithm specifics are assumed to be planned but not yet implemented.
- Auth state handling (logged-in vs logged-out navbar variants) inferred but not fully specified.