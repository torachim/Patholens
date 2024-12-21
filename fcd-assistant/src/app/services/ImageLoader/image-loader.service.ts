import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NVImage } from '@niivue/niivue'

/*
This Service is supposed to fetch the MRI images (the NIFTI data) from the backend and supply it to the frontend.
*/

@Injectable({
  providedIn: 'root'
})
export class ImageLoaderService {
  readonly http: HttpClient;

  constructor(httpClient: HttpClient) {
    // Inject the HTTP Client
    this.http = httpClient;
  }

  // experimental code to load a test image from local storage
  getTestNiivueImage(): NVImage | null {
    let image: NVImage;
    let imagePromise: Promise<NVImage>;

    this.http.get('./assets/test/sub-00001_space-orig_FLAIR.nii', {responseType: 'blob'}).subscribe((blob) => {
      var imageFile = new File([blob], 'imageFile');
      imagePromise = NVImage.loadFromFile({file: imageFile});

      imagePromise.then((nvImage) => {
        image = nvImage;
        return image;

      }, (error) => {
        console.log(error);
      });
    });

    return null;
  }
}
