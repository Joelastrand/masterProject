import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetusernameComponent } from './setusername.component';

describe('SetusernameComponent', () => {
  let component: SetusernameComponent;
  let fixture: ComponentFixture<SetusernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetusernameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetusernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
