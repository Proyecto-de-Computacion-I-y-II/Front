import { TestBed } from '@angular/core/testing';

import { ProductoTempService } from './producto-temp.service';

describe('ProductoTempService', () => {
  let service: ProductoTempService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoTempService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
