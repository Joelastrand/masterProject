import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeViewWithFriendComponent } from './challengeViewWithFriend.component';

describe('ChallengeViewWithFriendComponent', () => {
  let component: ChallengeViewWithFriendComponent;
  let fixture: ComponentFixture<ChallengeViewWithFriendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengeViewWithFriendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeViewWithFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
