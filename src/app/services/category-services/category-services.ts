import { computed, Injectable, signal } from '@angular/core';
import { ExpenseCategory } from '../../models/expense';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Category } from '../../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  categories = signal<Category[]>([]);
  private categoryCollection = collection(db, 'categories');
  private categorySnapshotUnsubscribe: Unsubscribe | null = null;

  //READ (real-time)
  loadCategories() {
    if (this.categorySnapshotUnsubscribe) {
      return;
    }

    this.categorySnapshotUnsubscribe = onSnapshot(this.categoryCollection, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as Category[];

      this.categories.set(categoriesData);
    });
  }

  //CREATE
  async addCategory(category: Category) {
    await addDoc(this.categoryCollection, category);
  }
  //UPDATE
  async updateCategory(id: string, category: Partial<Category>) {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, { ...category });
  }
  //DELETE
  async deleteCategory(id: string) {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  }
}
