import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailychallengeComponent } from './dailychallenge.component';

describe('DailychallengeComponent', () => {
  let component: DailychallengeComponent;
  let fixture: ComponentFixture<DailychallengeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailychallengeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailychallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
