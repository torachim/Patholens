import { Component, inject, OnInit } from '@angular/core';
import { ImageLoaderService } from '../services/ImageLoader/image-loader.service';
import { Niivue } from '@niivue/niivue';

@Component({
  selector: 'app-nifti-viewer',
  imports: [],
  templateUrl: './nifti-viewer.component.html',
  styleUrl: './nifti-viewer.component.scss'
})
export class NiftiViewerComponent implements OnInit {

  imageLoaderService: ImageLoaderService;

  constructor(imageLoaderService: ImageLoaderService) {
    // Inject our service to load an MRI image from the backend
    this.imageLoaderService = imageLoaderService; // for now it's not used, as we load a local file from /assets
  }

  ngOnInit(): void {
    /*
    TODO: Create proper input logic on which patient data is supposed to be selected
    and use the imageLoaderService to fetch the data from the backend
    */ 

    // render the Niivue window on screen and feed it a test file
    const url = './assets/sub-00107_space-orig_FLAIR.nii.gz';
    const volumeList = [
      {
        url,
        schema: "nifti",
        volume: { hdr: null, img: null},
        colorMap: 'gray',
        opacity: 1,
        visible: true
      }
    ];
    
    const niivue = new Niivue({show3Dcrosshair: true});
    
    // attach to the canvas in the .html file of this component
    niivue.attachTo('gl');
    niivue.loadVolumes(volumeList);
  }
}
