import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeedbackEntity2 } from './create-feedback-entity-2';

describe('CreateFeedbackEntity2', () => {
  let component: CreateFeedbackEntity2;
  let fixture: ComponentFixture<CreateFeedbackEntity2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFeedbackEntity2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFeedbackEntity2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
