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
    width: fit-content;
    max-width: 100%;
    align-self: flex-start;
}
.parent-class {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.red-400 .pi.pi-trash {
    color: #ef4444 !important;
}
.green-400 .pi.pi-folder-plus, .green-400 .pi.pi-file-plus {
    color: #22c55e !important;
}

.yellow-400 .pi.pi-pencil {
    color: #eab308 !important;
}

.p-button {
    padding: 0px 0px !important; 
    width: auto !important;
    font-size: 0.875rem !important;
}
.p-button .pi.pi-trash,
.p-button .pi.pi-file-plus,
.p-button .pi.pi-folder-plus,
.p-button .pi.pi-pencil {
  font-size: 0.7rem !important;
}
.p-tree-node-content.p-tree-node-selectable {
  width: fit-content !important;
  max-width: 100%;
}
.p-tree-node-content.p-tree-node-selectable.p-highlight,
.p-tree-node-content.p-tree-node-selectable:hover {
  width: fit-content !important;
  max-width: 100%;
  background: #374151 !important; /* norimas fonas */
}


/* -----------RATING STARS--------------- */

.p-rating .p-rating-option:nth-child(1)[data-p-active="true"] .p-rating-icon {
  color: #ef4444 !important;
}
.p-rating .p-rating-option:nth-child(2)[data-p-active="true"] .p-rating-icon {
  color: #fb923c !important;
}
.p-rating .p-rating-option:nth-child(3)[data-p-active="true"] .p-rating-icon {
  color: #fde047 !important;
}
.p-rating .p-rating-option:nth-child(4)[data-p-active="true"] .p-rating-icon {
  color: #4ade80 !important;
}
.p-rating .p-rating-option:nth-child(5)[data-p-active="true"] .p-rating-icon {
  color: #22c55e !important;
}

/* -----------RATING STARS SIZE--------------- */

.p-rating {
  --p-rating-icon-size: 10px; /* arba norimas dydis */
}

/*----------BUTTONS EXPAND AND ADD------------------*/

.flex.flex-wrap.gap-2 > .p-button {
  align-items: center;
  display: inline-flex;
  vertical-align: middle;
  height: 1.5em; /* arba norimas aukštis */
  line-height: 1;
  gap: 0.2rem;
  background: #18181B !important; /* tamsus fonas */
  color: #FFFFFF !important; /* geltonas tekstas */
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px 12px 0 0;
  font-weight: bold;
  padding: 0px 5px !important; 
  width: auto !important;
  font-size: 0.875rem !important;
}
.p-button .p-button-icon {
  vertical-align: middle; /* Centruoti ikoną vertikaliai */
  font-size: 0.7em; /* arba px, pvz. 20px */
}

.flex.flex-wrap.gap-2 > .p-button {
  margin-right: 8px; /* Pridėti tarpus tarp mygtukų */
}
.flex.flex-wrap.gap-2 > .p-button:last-child {
  margin-right: 0; /* Pašalinti tarpus po paskutiniu mygtuku */
}

/*--------------Root Folder Styles--------------- */

.root-folder {
border-bottom: 1px solid #374151;
}

</style>