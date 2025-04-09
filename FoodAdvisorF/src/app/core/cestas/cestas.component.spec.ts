import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CestasComponent } from './cestas.component';

describe('CestasComponent', () => {
  let component: CestasComponent;
  let fixture: ComponentFixture<CestasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CestasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CestasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
