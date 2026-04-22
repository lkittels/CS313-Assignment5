export interface Category {
  id?: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  isActive: boolean;
  createdAt: number;
}
