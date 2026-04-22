import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { UserService } from '../../../services/user-services/user.services';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly registrationForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    budgetGoal: [0, [Validators.required, Validators.min(0)]],
  });

  async registerWithEmailAndPassword(): Promise<void> {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { name, email, password, budgetGoal } = this.registrationForm.getRawValue();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await this.userService.createUserProfile({
        id: userCredential.user.uid,
        name: name.trim(),
        email: email.trim(),
        budgetGoal,
      });
      this.successMessage.set('Registration successful. Your account is ready.');
      this.registrationForm.reset({
        name: '',
        email: '',
        password: '',
        budgetGoal: 0,
      });
      await this.router.navigateByUrl('/');
    } catch (error: unknown) {
      this.errorMessage.set(this.mapFirebaseError(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapFirebaseError(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return 'Registration failed. Please try again.';
    }

    const code = String((error as { code: unknown }).code);

    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already in use.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}
