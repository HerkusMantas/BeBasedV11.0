

# Copilot Instructions for vue-bebasedv11-0

## Architecture & Key Concepts
- **Vue 3 + Vite**: Uses `<script setup>` and Composition API exclusively. No legacy Vue 2 syntax.
- **Main entry**: `src/main.js` mounts `App.vue`.
- **Routing**: `src/router/index.js` defines all routes, including dynamic `/canvas/:id`.
- **State**: Pinia stores in `src/stores/` (see `counter.js` for example).
- **Backend**: Firebase (Firestore, Auth, Storage) via `src/firebase.js`.

## Core Components & Data Flow
- `src/components/FileTree.vue`: Central for CRUD, tree structure, and UI logic. Nodes have `key` (Firebase ID), `type` (`folder`/`file`), `icon`, `iconColor`, `children`, and `isPending` for new nodes.
- **CRUD**: Use Firestore (`addDoc`, `getDocs`, `updateDoc`, `deleteDoc`) on `folders`/`canvases` collections. Always use `key` as document ID.
- **Trash/Restore**: Deleted nodes go to `deletedItems` (see `moveToTrash`/`SidebarTrash.vue`). Restore with original metadata and `setDoc`.
- **Context Menus**: Use `ContextMenuFileTree.vue` and `lastNode.value` for node actions (rename, icon/color, delete).
- **Icon/Color**: Use `IconPickerModal.vue` for icon/color changes. Always update Firestore and UI state together.
- **UI State**: Use `expandedKeys`, `selectedKey`, and `hover` for tree state. New nodes use `isPending` and are finalized on rename.

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

## Integration Points
- **Firebase**: All data/auth flows via `src/firebase.js`.
- **Pinia**: For global/shared state (see `src/stores/`).
- **PrimeVue**: UI components (Tree, Button, Rating, Sidebar, etc.).
- **Iconify**: For icons in tree and dialogs.

## Example Patterns
**Add Canvas Node:**
```js
const canvasData = { type: 'file', label: 'New Canvas', ... }
const id = await addCanvas(canvasData)
node.key = id
```
**Navigate to Canvas:**
```js
router.push({ name: 'Canvas', params: { id: node.key } })
```
**Restore from Trash:**
See `SidebarTrash.vue` for restoring nodes with original metadata and updating UI.

**Pagal sita turi daryti canvas.vue turini**

https://konvajs.org/api/Konva.html

## References
- For architecture/conventions, see this file and `README.md`.
