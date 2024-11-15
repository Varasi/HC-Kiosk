import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBookTripComponent } from './account-book-trip.component';

describe('AccountBookTripComponent', () => {
  let component: AccountBookTripComponent;
  let fixture: ComponentFixture<AccountBookTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBookTripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountBookTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
