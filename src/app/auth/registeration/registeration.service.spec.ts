import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController  } from '@angular/common/http/testing';
import { RegisterationService } from './registeration.service';

describe('RegisterationService', () => {
  let service: RegisterationService;
  let httpMock: HttpTestingController;
  let mockUsers = [
    {id: 1, username: 'Lebron', address: {street: '1234'}, company: {catchPhrase: 'Hi'}},
    {id: 2, username: 'Kobe', address: {street: '5678'}, company: {catchPhrase: 'Hello'}},
    {id: 3, username: 'James', address: {street: '0000'}, company: {catchPhrase: 'Whats up'}},
    {id: 4, username: 'Bryant', address: {street: '1111'}, company: {catchPhrase: 'Hi there'}}
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegisterationService]
    });
    service = TestBed.inject(RegisterationService);
    httpMock = TestBed.inject(HttpTestingController);
    
    
    let store: any = {};
    spyOn(localStorage, 'getItem').and.callFake((key) => {
        return store[key] || null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
        store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key) => {
        delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
        store = {};
    });
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users from localStorage if they exist', () => {
    let users = service.getUser();
    users.subscribe((res) => {
        expect(res).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
});
  
  it('should login user based on username and password', () => {
    let user = service.loginUser('Lebron', '1234');
    user.subscribe((res) => {
      expect(res).toEqual(mockUsers[0]);
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });

  it('should clear current user', () => {
    service.clearCurrentUser();
    expect(service.getCurrentUser()).toEqual({});
  });

  it('should set and get current user', () => {
    service.setCurrentUser(mockUsers[0]);
    const user = [{
      id: 1,
      username: 'Lebron',
      address: { street: '1234' },
      company: { catchPhrase: 'Hi' }
    }];

    service.setCurrentUser(user);
    expect(service.getCurrentUser()).toEqual(user);
  });

  it('should fetch users from the API if localStorage is empty', () => {
    let users = service.getUser();
    users.subscribe((res) => {
        expect(res).toEqual(mockUsers);
    });
  
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });


  it('should store users to localStorage when fetched from the API', () => {
    let users = service.getUser();
    users.subscribe();
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  
    expect(localStorage.getItem('allUsers')).toEqual(JSON.stringify(mockUsers));
  });

  it('should return null if no user matches the provided login details', () => {
    let user = service.loginUser('IncorrectUser', 'IncorrectPassword');
    user.subscribe((res) => {
      expect(res).toBeNull();
    });
  
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });

  it('should get followed users based on user ID', () => {
    const userId = 1;
    
    const followedUsersObservable = service.getFollowedUsers(userId);
    
    followedUsersObservable.subscribe(followedUsers => {
        expect(followedUsers.length).toEqual(3);  

        const followedIds = followedUsers.map(user => user.id);
        expect(followedIds).toContain(2); 
        expect(followedIds).toContain(3); 
        expect(followedIds).toContain(4);  

        followedUsers.forEach(user => {
            expect(user.headline).toEqual(user.company.catchPhrase);
        });
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
});

  afterEach(() => {
    httpMock.verify();  
  });
});
