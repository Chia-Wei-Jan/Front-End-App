import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterationService } from './registeration/registeration.service';


function emailValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value);
  return validFormat ? null : { 'invalidEmail': true };
}

function phoneValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^\d{3}-\d{3}-\d{4}$/.test(control.value);
  return validFormat ? null : { 'invalidPhone': true };
}

function zipcodeValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^\d{5}$/.test(control.value);
  return validFormat ? null : { 'invalidZipcode': true };
}

function confirmPasswordValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { 'mismatchedPasswords': true };
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;

  users: any[] = [];
  loginError: string = '';
  registerError: string = '';
  usernameError: string = '';

  constructor(private formBuilder: FormBuilder, private router: Router, private registerationService: RegisterationService) { 
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required], 
      email: ['', [Validators.required, emailValidator]],
      zipcode: ['', [Validators.required, zipcodeValidator]],
      phone: ['', [Validators.required, phoneValidator]],
      dateOfBirth: ['']
    }, { validators: confirmPasswordValidator });

  }

  ngOnInit() {

  }

  login() {
    const val = this.loginForm.value;

    if (val.username && val.password) {
      this.registerationService.loginUser(val.username, val.password).subscribe((user: any[]) => {
        if (user) {
          this.registerationService.setCurrentUser(user);
          this.router.navigate(['/main']);
        } else {
          this.loginError = 'Invalid username or password';
        }
      });
    } else {
      this.loginError = 'Please enter both username and password';
    }

  }

  register() {
    if (this.registerForm.valid) {
      const newUser = {
        ...this.registerForm.value,
      };
      
      this.registerationService.getUser().subscribe(users => {
        if (!users.some(user => user.username === newUser.username)) {
          this.registerationService.setCurrentUser(newUser);
          this.router.navigate(['/main']);
        } else {
          this.usernameError = 'Username is already taken.';
        }
      });
    } 
  }  
}  