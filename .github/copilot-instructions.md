
# Copilot Instructions for vue-bebasedv11-0

## Project Architecture
- Vue 3 + Vite, using `<script setup>` and Composition API throughout.
- Main entry: `src/main.js` mounts `App.vue`.
- Routing: `src/router/index.js` (dynamic routes, e.g. `/canvas/:id`).
- State: Pinia stores in `src/stores/`.
- Firebase: `src/firebase.js` (Firestore, Auth, Storage) is the main backend.

## Key Directories & Files
- `src/components/`: UI and logic components (e.g., `FileTree.vue`, `ContextMenuFileTree.vue`, `IconPickerModal.vue`).
- `src/views/`: Page-level views (e.g., `Home.vue`, `Canvas.vue`, `LogIn.vue`).
- `src/service/NodeService.js`: Encapsulates backend/data logic.
- `src/router/index.js`: Vue Router config; add new routes here.
- `public/`: Static assets.

## Data Flow & Patterns
- **FileTree.vue**: Central for CRUD, tree structure, and UI logic. Nodes have `key` (Firebase ID), `type` (`folder`/`file`), `icon`, `iconColor`, and `children`.
- **CRUD**: Use Firestore methods (`addDoc`, `getDocs`, `updateDoc`, `deleteDoc`) with correct collection (`folders`, `canvases`). Always use `key` as the document ID.
- **Trash/Restore**: Deleted nodes are moved to `deletedItems` collection, with full metadata for restore. Use `moveToTrash` and `reloadTree` patterns.
- **Context Menu**: Node actions (rename, icon/color change, delete) are handled via context menu components and events. Pass node via event or ref (`lastNode.value`).
- **Icon/Color Selection**: Use `IconPickerModal.vue` for icon/color changes. Update Firestore and UI state together.
- **Routing**: Dynamic navigation to Canvas pages via `router.push({ name: 'Canvas', params: { id: node.key } })`. In views, get params via `useRoute()`.

## Developer Workflows
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- No built-in tests; add test scripts if needed.

## Project-Specific Conventions
- Always use `type` for distinguishing folders/files, not icon names.
- CRUD actions should update both Firestore and local UI state.
- Error handling: log errors to console, check document existence before update/delete.
- Use `expandedKeys`, `selectedKey`, and `hover` for UI state in trees.
- All new nodes should be added with `isPending` flag and finalized on rename.

## Integration Points
- **Firebase**: All data and auth flows go through Firestore/Auth. See `src/firebase.js` and usages in components.
- **Pinia**: State management for global/shared state.
- **PrimeVue**: UI components (Tree, Button, Rating, Sidebar, etc.).
- **Iconify**: For icons in tree and dialogs.

## Example: Add Canvas Node
```js
const canvasData = { type: 'file', label: 'New Canvas', ... }
const id = await addCanvas(canvasData)
node.key = id
```

## Example: Navigate to Canvas
```js
router.push({ name: 'Canvas', params: { id: node.key } })
```

## Additional Notes
- No legacy Vue 2 syntax; use Vue 3 composition API only.
- Static assets go in `public/`.
- For architecture/conventions, see this file and `README.md`.
