
# Copilot Instructions for vue-bebasedv11-0

## Architecture & Key Concepts
- **Vue 3 + Vite**: Uses `<script setup>` and Composition API. No legacy Vue 2 syntax.
- **Main entry**: `src/main.js` mounts `App.vue`.
- **Routing**: `src/router/index.js` defines all routes, including dynamic `/canvas/:id`.
- **State**: Pinia stores in `src/stores/` (see `canvasStore.js` for undo/redo, `counter.js` for example).
- **Backend**: Firebase (Firestore, Auth, Storage) via `src/firebase.js`.
- **UI Frameworks**: PrimeVue (Tree, Sidebar, Rating, etc.), Iconify for icons, vue-grid-layout for Canvas.

## Core Components & Data Flow
- `src/components/FileTree.vue`: Central for CRUD, tree structure, and UI logic. Nodes have `key` (Firebase ID), `type` (`folder`/`file`), `icon`, `iconColor`, `children`, and `isPending` for new nodes.
- **CRUD**: Use Firestore (`addDoc`, `getDocs`, `updateDoc`, `deleteDoc`) on `folders`/`canvases` collections. Always use `key` as document ID.
- **Trash/Restore**: Deleted nodes go to `deletedItems` (see `moveToTrash`/`SidebarTrash.vue`). Restore with original metadata and `setDoc`.
- **Context Menus**: Use `ContextMenuFileTree.vue` and `lastNode.value` for node actions (rename, icon/color, delete).
- **Icon/Color**: Use `IconPickerModal.vue` for icon/color changes. Always update Firestore and UI state together.
- **UI State**: Use `expandedKeys`, `selectedKey`, and `hover` for tree state. New nodes use `isPending` and are finalized on rename.
- **Canvas**: `Canvas.vue` uses vue-grid-layout for draggable/resizable elements. FloatingToolbar emits `add-text` to add text elements.

## Developer Workflows
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- No built-in tests; add test scripts if needed.

## Project-Specific Patterns
- Always distinguish folders/files by `type`, not icon.
- CRUD must update both Firestore and local UI state.
- Error handling: log errors to console, check doc existence before update/delete.
- All static assets go in `public/`.
- Use `reloadTree()` after restore or major changes to refresh UI.
- Canvas elements are managed in `textElements` (see `Canvas.vue`).
- Use Pinia store (`canvasStore.js`) for undo/redo of canvas state.

## Integration Points
- **Firebase**: All data/auth flows via `src/firebase.js`.
- **Pinia**: For global/shared state (see `src/stores/`).
- **PrimeVue**: UI components (Tree, Button, Rating, Sidebar, etc.).
- **Iconify**: For icons in tree and dialogs.
- **vue-grid-layout**: For Canvas layout and drag/drop.

## Example Patterns
**Add Canvas Node:**
```js
const canvasData = { type: 'file', label: 'New Canvas', ... }
const id = await addCanvas(canvasData)
node.key = id
```
**Navigate to Canvas:**
```js
router.push({ name: 'Canvas', params: { id: node.key })
```
**Restore from Trash:**
See `SidebarTrash.vue` for restoring nodes with original metadata and updating UI.

**Canvas Usage:**
Naudok [vue-grid-layout dokumentaciją](https://jbaysolutions.github.io/vue-grid-layout/guide/) kaip pagrindinį šaltinį kuriant ir tobulinant `Canvas.vue` funkcionalumą. Visi drag & drop, resizavimo, grid ir susiję sprendimai turi remtis šia dokumentacija.
See `Canvas.vue` for vue-grid-layout usage and FloatingToolbar integration.

## References
- For architecture/conventions, see this file and `README.md`.
