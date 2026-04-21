import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AgChartsModule } from 'ag-charts-angular';
import { AgPolarChartOptions } from 'ag-charts-community';
import { ExpenseService } from '../../../../services/expense-services/expense-service';

type PieChartDatum = {
  asset: string;
  amount: number;
};

@Component({
  selector: 'app-pie-chart',
  imports: [AgChartsModule],
  templateUrl: './pie-chart.html',
  styleUrl: './pie-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart {
  private readonly expenseService = inject(ExpenseService);

  readonly selectedYear = signal(new Date().getFullYear());
  readonly selectedCategory = signal<string | null>(null);

  readonly chartOptions = computed<AgPolarChartOptions>(() => ({
    title: {
      text: 'Categorical Spending',
    },
    data: this.getData(),
    series: [
      {
        type: 'pie',
        angleKey: 'amount',
        legendItemKey: 'asset',
        calloutLabelKey: 'asset',
        fill: '#b91c1c',
      },
    ],
  }));

  getData(): PieChartDatum[] {
    const selectedYear = this.selectedYear();
    const selectedCategory = this.selectedCategory();

    const filteredExpenses = this.expenseService
      .expenses()
      .filter((entry) => {
        const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
        return !Number.isNaN(entryDate.getTime()) && entryDate.getFullYear() === selectedYear;
      })
      .filter((entry) => entry.type === 'Expense')
      .filter((entry) => (selectedCategory ? entry.category === selectedCategory : true));

    const totalsByCategory = filteredExpenses.reduce((totals, entry) => {
      const category = entry.category || 'Other';
      totals.set(category, (totals.get(category) ?? 0) + entry.amount);
      return totals;
    }, new Map<string, number>());

    return Array.from(totalsByCategory, ([asset, amount]) => ({ asset, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }
}
