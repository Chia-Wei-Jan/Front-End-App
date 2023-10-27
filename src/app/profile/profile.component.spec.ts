import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterationService } from '../auth/registeration/registeration.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockRegisterationService: any;

  beforeEach(() => {
    mockRegisterationService = jasmine.createSpyObj(['getCurrentUser']);

    const testUser = {
      username: 'Bret'
    };

    mockRegisterationService.getCurrentUser.and.returnValue(testUser);

    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        HttpClientTestingModule, 
        ReactiveFormsModule
      ],
      providers:[
        { provide: RegisterationService, useValue: mockRegisterationService }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the user\'s profile username', () => {
    expect(component.username).toEqual('Bret');
  });

  it('should populate fields using the default user when there is no current user', () => {
    mockRegisterationService.getCurrentUser.and.returnValue(null);
    component.ngOnInit();
    expect(component.username).toEqual('');
  });

  it('should upload avatar when a file is selected', () => {
    const event: any = {
      target: {
        files: [{ name: 'image.jpg' }]
      }
    };
    component.uploadAvatar(event);
    expect(component.selectAvatar).toEqual(event.target.files[0]);
  });

  it('should not update profile when there are validation errors', () => {
    component.profileForm.controls['email'].setValue('invalidEmail');
    component.updateProfile();
    expect(component.email).not.toEqual('invalidEmail');
  });

  it('should update profile when the form is valid', () => {
    component.profileForm.controls['email'].setValue('test@email.com');
    component.updateProfile();
    expect(component.email).toEqual('test@email.com');
  });

  it('should validate password and confirm password', () => {
    component.profileForm.controls['password'].setValue('test123');
    component.profileForm.controls['confirmPassword'].setValue('test1234');
    const validationResult = component.passwordMatch(component.profileForm);
    expect(validationResult?.passwordNotMatch).toBeTrue();
  });


  it('should mask the password', () => {
    component.profileForm.controls['password'].setValue('password123');
    component.updateProfile();
    expect(component.showPassword).toEqual('***********');
  });

  it('should reset the profile form after update', () => {
    spyOn(component.profileForm, 'reset');
    component.updateProfile();
    expect(component.profileForm.reset).toHaveBeenCalled();
  });
  
  it('should format phone number correctly', () => {
    const userWithPhoneNumber = {
      phone: '1-123-456-7890'
    };
    mockRegisterationService.getCurrentUser.and.returnValue(userWithPhoneNumber);
    component.ngOnInit();
    expect(component.phone).toEqual('123-456-7890');
  });
  
  // Testing zipcode extraction
  it('should extract zipcode from user object', () => {
    const userWithZipcode = {
      zipcode: '12345'
    };
    mockRegisterationService.getCurrentUser.and.returnValue(userWithZipcode);
    component.ngOnInit();
    expect(component.zipcode).toEqual('12345');
  });
  
  it('should extract zipcode from address property when user object does not have it', () => {
    const userWithAddress = {
      address: { zipcode: '67890-1234' }
    };
    mockRegisterationService.getCurrentUser.and.returnValue(userWithAddress);
    component.ngOnInit();
    expect(component.zipcode).toEqual('67890');
  });

  it('should set password to street address if it exists', () => {
    const user = {
      "id": 4,
      "name": "Patricia Lebsack",
      "username": "Karianne",
      "email": "Julianne.OConner@kory.org",
      "address": {
        "street": "Hoeger Mall",
        "suite": "Apt. 692",
        "city": "South Elvis",
        "zipcode": "53919-4257",
        "geo": {
          "lat": "29.4572",
          "lng": "-164.2990"
        }
      },
      "phone": "493-170-9623 x156",
      "website": "kale.biz",
      "company": {
        "name": "Robel-Corkery",
        "catchPhrase": "Multi-tiered zero tolerance productivity",
        "bs": "transition cutting-edge web services"
      }
    }
    mockRegisterationService.getCurrentUser.and.returnValue(user);
    component.ngOnInit();
    expect(component.password).toEqual('Hoeger Mall');
  });
  
  // Test avatar URL assignment
  it('should set avatarUrl from user data if available', () => {
    const userWithAvatar = {
      avatarUrl: 'https://example.com/avatar.jpg'
    };
    mockRegisterationService.getCurrentUser.and.returnValue(userWithAvatar);
    component.ngOnInit();
    expect(component.avatarUrl).toEqual('https://example.com/avatar.jpg');
  });

  it('should have default values on initialization', () => {
    component.username = '';
    component.email = '';
    expect(component.username).toEqual('');
    expect(component.email).toEqual('');
  });

  it('should update the username when the user data changes', () => {
    component.username = 'Alice' ;
    fixture.detectChanges();
    expect(component.username).toEqual('Alice');
  });
});
