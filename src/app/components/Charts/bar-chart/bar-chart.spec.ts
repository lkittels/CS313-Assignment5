import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChart } from './bar-chart';

describe('BarChart', () => {
  let component: BarChart;
  let fixture: ComponentFixture<BarChart>;

  beforeEach(async () => {
    TestBed.overrideComponent(BarChart, {
      set: {
        template: '<p>bar-chart-test</p>',
      },
    });

    await TestBed.configureTestingModule({
      imports: [BarChart],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
