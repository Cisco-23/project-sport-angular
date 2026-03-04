import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Level } from '../../../../models/level.enum';
import { Card } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../../models/user.model';
import { Role } from '../../../../models/role.enum';
@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    Card,
    FormsModule,
    InputTextModule,
    SelectModule,
    Button,
    DatePicker,
  ],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage: string = '';

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    birthDate: [null as any | null, Validators.required],
    gender: ['', Validators.required],
    level: [null as Level | null, Validators.required],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const formValues = this.registerForm.value;
      const date = formValues.birthDate as Date;
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDay();
      const formattedBirthDate = `${year}-${month}-${day}`;

      const userToSave: any = {
        name: formValues.name!,
        email: formValues.email!,
        password: formValues.password!,
        birthDate: formattedBirthDate,
        gender: formValues.gender!,
        level: formValues.level!,
        role: Role.USER,
      };

      this.authService.register(userToSave).subscribe({
        next: (value) => {
          console.log('Usuario creado en MongoDB', value);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log('Ha fallado el registro\n', err);
          this.errorMessage = 'Hubo un error al registrar el usuario. Comprobar datos';
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  optionsGener = [
    { label: 'Hombre', value: 'Hombre' },
    { label: 'Mujer', value: 'Mujer' },
  ];

  optionsLevel = [
    { label: 'Principiante', value: Level.BASIC },
    { label: 'Intermedio', value: Level.MEDIUM },
    { label: 'Alto', value: Level.HIGH },
  ];
}
