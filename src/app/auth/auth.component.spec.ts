import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterationService } from './registeration/registeration.service';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let mockRegistrationService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockRegistrationService = jasmine.createSpyObj(['loginUser', 'setCurrentUser', 'getUser']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: RegisterationService, useValue: mockRegistrationService },
        { provide: Router, useValue: mockRouter },
        FormBuilder
      ]
    });
    
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;

    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log in a user and set the login state', () => {
    const mockUser = { username: 'Bret', password: 'Kulas Light' };
    mockRegistrationService.loginUser.and.returnValue(of([mockUser]));
    component.loginForm.setValue({ username: 'Bret', password: 'Kulas Light' });
    component.login();
    expect(mockRegistrationService.setCurrentUser).toHaveBeenCalledWith([mockUser]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('should show an error when username or password is missing', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.login();
    expect(component.loginError).toBe('Please enter both username and password');
  });

  it('should not log in an invalid user and set the error state', () => {
    mockRegistrationService.loginUser.and.returnValue(of(null));
    component.loginForm.setValue({ username: 'Bret', password: 'asd123123' });
    component.login();

    expect(mockRegistrationService.setCurrentUser).not.toHaveBeenCalled();
    expect(component.loginError).toBe('Invalid username or password');
  });

  it('should register a valid user and navigate to main', () => {
    const mockNewUser = {
        name: 'Lebron James',
        username: 'Lebron',
        password: 'Password123',
        confirmPassword: 'Password123',
        email: 'asd@gmail.com',
        zipcode: '12345',
        phone: '123-456-7890',
        dateOfBirth: '2000-12-31'
    };

    mockRegistrationService.getUser.and.returnValue(of([]));
    component.registerForm.setValue(mockNewUser);

    component.register();

    expect(mockRegistrationService.setCurrentUser).toHaveBeenCalledWith(mockNewUser);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('should show an error when trying to register with an already taken username', () => {
    const existingUser = {
      name: 'Leanne Graham',
      username: 'Bret',
      password: 'Kulas Light',
      confirmPassword: 'Kulas Light',
      email: 'Sincere@april.biz',
      zipcode: '92998',
      phone: '770-736-8031',
      dateOfBirth: '2000-12-31'
    };
    const newUser = { ...existingUser, password: 'Kulas Light' };
    mockRegistrationService.getUser.and.returnValue(of([existingUser]));
    component.registerForm.setValue(newUser);
    component.register();

    expect(component.usernameError).toBe('Username is already taken.');
  });

  it('should show an error when trying to login without entering any details', () => {
    component.login();
    expect(component.loginError).toBe('Please enter both username and password');
  });

  it('should not register when form is invalid', () => {
    component.register();
    expect(mockRegistrationService.setCurrentUser).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/main']);
  });
});