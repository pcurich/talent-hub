import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardLayout } from './wizard-layout';

describe('WizardLayout', () => {
  let component: WizardLayout;
  let fixture: ComponentFixture<WizardLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
