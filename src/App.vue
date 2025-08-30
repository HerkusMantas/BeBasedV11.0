<template>
  <router-view />
</template>

<style>
.p-tree-node-content.p-tree-node-selectable {
  display: flex !important;
  width: auto !important;
  min-width: unset !important;
  max-width: unset !important;
}
.p-tree-node-content > span:last-child {
  margin-right: 30px !important;
}
.norowrap {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    white-space: nowrap;
    gap: 0.5rem;
}
.red-400 .pi.pi-trash {
    color: #ef4444 !important;
}
</style>