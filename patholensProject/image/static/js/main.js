import { Niivue } from "./index.js"

document.addEventListener('DOMContentLoaded', function() {
  const nv = new Niivue();
  const canvas = document.getElementById('niivue-canvas');
  nv.attachToCanvas(canvas);
  const flairUrl = '/static/images/sub-00003_space-orig_FLAIR.nii.gz';
  nv.loadVolumes([{ url: flairUrl }]);
});