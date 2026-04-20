import { TestBed } from '@angular/core/testing';

import { TransactionListService } from './transactionlist-service';

describe('TransactionListService', () => {
  let service: TransactionListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
