import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeviewComponent } from './challengeview.component';

describe('ChallengeviewComponent', () => {
  let component: ChallengeviewComponent;
  let fixture: ComponentFixture<ChallengeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengeviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
