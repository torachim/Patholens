import { Niivue } from "./index.js"

document.addEventListener('DOMContentLoaded', function() {
  const nv = new Niivue();
  const canvas = document.getElementById('niivue-canvas');
  nv.attachToCanvas(canvas);
});