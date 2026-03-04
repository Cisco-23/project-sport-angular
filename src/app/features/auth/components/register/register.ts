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

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required, Validators.email],
    password: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['', Validators.required],
    level: [null as Level | null, Validators.required],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
    }
  }

  optionsGener = [
    { label: 'Hombre', value: 'Hombre' },
    { label: 'Mujer', value: 'Mujer' },
  ];

  optionsLevel = [
    { label: 'Nivel principiante', value: Level.BASIC },
    { label: 'Nivel intermedio', value: Level.MEDIUM },
    { label: 'Nivel alto', value: Level.HIGH },
  ];
}
