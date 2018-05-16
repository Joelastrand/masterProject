import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeWithFriendComponent } from './challengeWithFriend.component';

describe('ChallengeWithFriendComponent', () => {
  let component: ChallengeWithFriendComponent;
  let fixture: ComponentFixture<ChallengeWithFriendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengeWithFriendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeWithFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
