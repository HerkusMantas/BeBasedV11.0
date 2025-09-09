# Copilot Instructions for vue-bebasedv11-0

## Project Overview
- This is a Vue 3 project using Vite as the build tool.
- The codebase is organized by feature: components, views, services, stores, and routing.
- Main entry: `src/main.js` mounts `App.vue`.
- Routing is handled via `src/router/index.js`.
- State management uses Pinia (see `src/stores/counter.js`).
- Firebase integration is present in `src/firebase.js` and referenced in auth-related views.

## Key Directories & Files
- `src/components/`: Reusable UI components (e.g., `FileTree.vue`, `SidebarCog.vue`).
- `src/views/`: Page-level components (e.g., `Home.vue`, `LogIn.vue`, `SignUp.vue`).
- `src/service/NodeService.js`: Service for backend/data operations.
- `src/stores/`: Pinia store modules.
- `src/router/index.js`: Vue Router setup.
- `public/`: Static assets (e.g., `favicon.ico`).

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Lint code:** `npm run lint`
- No test scripts or test directories detected; testing is not currently integrated.

## Patterns & Conventions
- Components use the `<script setup>` syntax for composition API.
- Service modules (e.g., `NodeService.js`) encapsulate API/data logic.
- Views import components and services as needed; keep logic in services, not views.
- Pinia stores are used for state; mutations and actions are defined in store files.
- Routing is centralized in `src/router/index.js`.
- Firebase is initialized in `src/firebase.js` and imported where needed.

## Integration Points
- **Firebase:** Used for authentication and possibly data storage. See `src/firebase.js` and auth views.
- **Pinia:** State management, see `src/stores/counter.js`.
- **Vite:** Handles build and dev server; config in `vite.config.js`.
- **ESLint:** Config in `eslint.config.js`.

## Example: Adding a New Page
1. Create a new view in `src/views/` (e.g., `NewPage.vue`).
2. Add a route in `src/router/index.js`.
3. Import and use components from `src/components/` as needed.

## Example: Using a Service
- Import service in a component or view:
  ```js
  import NodeService from '../service/NodeService'
  NodeService.someMethod()
  ```

## Additional Notes
- No custom build/test/debug commands beyond standard Vite scripts.
- No legacy Vue 2 syntax; use Vue 3 composition API.
- Static assets go in `public/`.

---
For questions about architecture or conventions, see this file and `README.md`.
