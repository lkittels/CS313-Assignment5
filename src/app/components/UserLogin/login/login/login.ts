import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../firebase.config';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async loginWithEmailAndPassword(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      this.successMessage.set('Login successful. Redirecting...');
      await this.router.navigateByUrl('/');
    } catch (error: unknown) {
      this.errorMessage.set(this.mapFirebaseError(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapFirebaseError(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return 'Login failed. Please try again.';
    }

    const code = String((error as { code: unknown }).code);

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Login failed. Please try again.';
    }
  }
}
