import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengefriendComponent } from './challengefriend.component';

describe('ChallengefriendComponent', () => {
  let component: ChallengefriendComponent;
  let fixture: ComponentFixture<ChallengefriendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengefriendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengefriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
