import { Injectable, OnDestroy, signal } from '@angular/core';
import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  readonly currentUserProfile = signal<User | null>(null);

  private profileUnsubscribe: Unsubscribe | null = null;

  async createUserProfile(profile: User): Promise<void> {
    const now = Date.now();
    await setDoc(
      doc(db, 'users', profile.id),
      {
        ...profile,
        createdAt: profile.createdAt ?? now,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const profileDoc = await getDoc(doc(db, 'users', userId));
    if (!profileDoc.exists()) {
      return null;
    }

    const data = profileDoc.data() as Omit<User, 'id'>;
    return {
      id: profileDoc.id,
      ...data,
    };
  }

  async updateUserProfile(userId: string, profileUpdate: Partial<User>): Promise<void> {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...profileUpdate,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }

  watchUserProfile(userId: string): void {
    this.profileUnsubscribe?.();
    this.profileUnsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
      if (!snapshot.exists()) {
        this.currentUserProfile.set(null);
        return;
      }

      const data = snapshot.data() as Omit<User, 'id'>;
      this.currentUserProfile.set({
        id: snapshot.id,
        ...data,
      });
    });
  }

  clearUserProfileWatch(): void {
    this.profileUnsubscribe?.();
    this.profileUnsubscribe = null;
    this.currentUserProfile.set(null);
  }

  ngOnDestroy(): void {
    this.clearUserProfileWatch();
  }
}
