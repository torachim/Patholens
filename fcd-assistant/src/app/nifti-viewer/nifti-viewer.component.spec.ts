import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NiftiViewerComponent } from './nifti-viewer.component';

describe('NiftiViewerComponent', () => {
  let component: NiftiViewerComponent;
  let fixture: ComponentFixture<NiftiViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NiftiViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NiftiViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
