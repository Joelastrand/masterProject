import { TestBed, inject } from '@angular/core/testing';

import { AchievementCheckerService } from './achievement-checker.service';

describe('AchievementCheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AchievementCheckerService]
    });
  });

  it('should be created', inject([AchievementCheckerService], (service: AchievementCheckerService) => {
    expect(service).toBeTruthy();
  }));
});
