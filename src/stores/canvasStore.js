import { defineStore } from 'pinia';

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    history: [],
    historyIndex: -1,
  }),
  actions: {
    // Išsaugo naują būseną istorijoje
    pushState(shapes) {
      // Išvalome ateities istoriją, jei buvo atliktas undo
      this.history = this.history.slice(0, this.historyIndex + 1);
      // Geriau saugoti gilią kopiją, kad išvengti netikėtų mutacijų
      this.history.push(JSON.parse(JSON.stringify(shapes)));
      this.historyIndex++;
    },
    // Atšaukia veiksmą
    undo(currentShapes) {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const previousState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        currentShapes.splice(0, currentShapes.length, ...previousState);
      }
    },
    // Grąžina atšauktą veiksmą
    redo(currentShapes) {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const nextState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        currentShapes.splice(0, currentShapes.length, ...nextState);
      }
    },
    // Išvalo istoriją (pvz., užkraunant naują drobę)
    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
    }
  },
});