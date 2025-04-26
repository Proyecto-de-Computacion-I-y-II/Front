import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubproductosTemporadaComponent } from './subproductos-temporada.component';

describe('SubproductosTemporadaComponent', () => {
  let component: SubproductosTemporadaComponent;
  let fixture: ComponentFixture<SubproductosTemporadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubproductosTemporadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubproductosTemporadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
