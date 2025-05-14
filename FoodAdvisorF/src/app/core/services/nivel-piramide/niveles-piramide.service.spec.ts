import { TestBed } from '@angular/core/testing';

import { NivelesPiramideService } from './niveles-piramide.service';

describe('NivelesPiramideService', () => {
  let service: NivelesPiramideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NivelesPiramideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
