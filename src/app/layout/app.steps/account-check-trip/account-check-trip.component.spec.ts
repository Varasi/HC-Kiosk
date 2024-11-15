import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCheckTripComponent } from './account-check-trip.component';

describe('AccountCheckTripComponent', () => {
  let component: AccountCheckTripComponent;
  let fixture: ComponentFixture<AccountCheckTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountCheckTripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountCheckTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
