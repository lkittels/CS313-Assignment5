import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChart } from './pie-chart';

describe('PieChart', () => {
  let component: PieChart;
  let fixture: ComponentFixture<PieChart>;

  beforeEach(async () => {
    TestBed.overrideComponent(PieChart, {
      set: {
        template: '<p>pie-chart-test</p>',
      },
    });

    await TestBed.configureTestingModule({
      imports: [PieChart],
    }).compileComponents();

    fixture = TestBed.createComponent(PieChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
