import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MainComponent } from './main.component';
import { AuthComponent } from '../auth/auth.component';
import { RegisterationService } from '../auth/registeration/registeration.service';
import { PostService } from './posts/posts.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { throwError } from 'rxjs';

describe('MainComponent', () => {
  let mainComponent: MainComponent;
  let authComponent: AuthComponent;
  let fixture: ComponentFixture<MainComponent>;
  let mockRegisterationService: any;
  let mockPostService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockRegisterationService = jasmine.createSpyObj(['loginUser', 'getCurrentUser', 'getUser', 'setCurrentUser', 'clearCurrentUser', 'addFollower', 'getFollowedUsers']);
    mockPostService = jasmine.createSpyObj(['getPostsByIds', 'getUserById','getUserPosts']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mockRegisterationService.getUser.and.returnValue(of([{ username: 'Bret', password: 'Kulas Light', address: { street: 'Kulas Light' } }]));

    let mockPosts = [
      {
        id: 1,
        title: "Sample Post 1",
        content: "This is a mock post content for testing."
      },
      {
        id: 2,
        title: "Sample Post 2",
        content: "Another mock post content for testing."
      }
    ];
  
    // Sample mockUser data:
    let mockUsers = [
      {
        id: 1,
        name: "John Doe",
        company: {
          name: "MockTech1",
          catchPhrase: "Innovating mock solutions."
        }
      },
      {
        id: 2,
        name: "Jane Smith",
        company: {
          name: "MockTech2",
          catchPhrase: "Crafting the future."
        }
      }
    ];

    TestBed.configureTestingModule({
      declarations: [MainComponent, AuthComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: RegisterationService, useValue: mockRegisterationService },
        { provide: PostService, useValue: mockPostService},
        { provide: Router, useValue: mockRouter },
        FormBuilder
      ]
    });
    fixture = TestBed.createComponent(MainComponent);
    mainComponent = fixture.componentInstance;
    authComponent = TestBed.createComponent(AuthComponent).componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    mockRegisterationService.getUser.calls.reset();
  });

  it('should create', () => {
    expect(mainComponent).toBeTruthy();
  });

  it('should log out a user and login state should be cleared', () => {
    const mockUser = { username: 'Bret', password: 'Kulas Light' };
    mockRegisterationService.loginUser.and.returnValue(of([mockUser]));
    authComponent.loginForm.setValue({ username: 'Bret', password: 'Kulas Light' });
    authComponent.login();

    mainComponent.logout();

    expect(localStorage.getItem('headline')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['\auth']);
    expect(mockRegisterationService.clearCurrentUser).toHaveBeenCalled();
  })

  it('should not add follower if newFollowerName is empty', () => {
    mainComponent.newFollowerName = '';
    mainComponent.addFollower();
    expect(mockRegisterationService.getUser).not.toHaveBeenCalled();
  });

  it('should set error if user already follows the new follower', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Antonette';
    mainComponent.followedUsers = [{ name: 'Antonette' }];
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should set error if the new follower does not exist', () => {
    mainComponent.newFollowerName = 'Peter';
    mockRegisterationService.getUser.and.returnValue(of([]));  // No users found
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should add articles when adding a follower (posts state is larger)', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Kamren';
    mockRegisterationService.getUser.and.returnValue(of([{ id: 5, username: 'Kamren', company: { catchPhrase: 'companyHeadline' } }]));
    mainComponent.posts = Array(10).fill({}).map((_, i) => ({ id: i, title: `Post ${i} by Bret` }));
    
    mockPostService.getPostsByIds.and.returnValue(of([{ id: 5, title: 'Post by newUser' }]));
    
  
    const initialPostLength = mainComponent.posts.length;
    mainComponent.addFollower();
    expect(mainComponent.posts.length).toBeGreaterThan(initialPostLength);  
  });

  it('should remove articles when removing a follower (posts state is smaller)', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.followedUsers = [
      { id: 2, username: "Antonette"},
      { id: 3, username: "Samantha"},
      { id: 4, username: "Karianne"}
    ];
    mainComponent.posts = [
      { userId: 1, title: 'Post by Bret'},
      { userId: 2, title: 'Post by Antonette'},
      { userId: 2, title: 'Another post by Antonette'},
      { userId: 3, title: 'Post by Samantha'},
      { userId: 4, title: 'Post by Karianne'}
    ];
    mainComponent.filterPost = [...mainComponent.posts];

    const initialPostLength = mainComponent.posts.length;
    
    mainComponent.unfollowUser(1);

    expect(mainComponent.posts.length).toBeLessThan(initialPostLength);
    expect(mainComponent.posts.some(post => post.userId === 3)).toBeFalsy();
  })

  it('should display filter articles based on search keyword', () => {
    mainComponent.posts = [
      {authorName: 'Bret', body: 'Post by Bret'},
      {authorName: 'Antonette', body: 'Post by Antonette'},
      {authorName: 'Samantha', body: 'Post by Samantha that contains Bret'}
    ];

    mainComponent.searchKeyword = 'Bret';
    mainComponent.searchPost();

    expect(mainComponent.filterPost.length).toEqual(2);
    expect(mainComponent.filterPost[0].authorName).toBe('Bret');
    expect(mainComponent.filterPost[1].body).toContain('Bret');

    mainComponent.searchKeyword = 'Antonette';
    mainComponent.searchPost();

    expect(mainComponent.filterPost.length).toEqual(1);
    expect(mainComponent.filterPost[0].body).toBe('Post by Antonette');

    mainComponent.searchKeyword = '';
    mainComponent.searchPost();
    expect(mainComponent.filterPost.length).toEqual(mainComponent.posts.length);
  });

  it('should fetch articles for current logged in user (posts state is set)', () => {
    const mockUser = { id: 1, username: 'Bret', password: 'Kulas Light' };
    mockRegisterationService.loginUser.and.returnValue(of(mockUser));

    authComponent.loginForm.setValue({ username: 'Bret', password: 'Kulas Light' });
    authComponent.login();

    const mockPosts = [{ id: 1, title: 'Post by newUser' }];
    mockPostService.getPostsByIds.and.returnValue(of(mockPosts));

    fixture.detectChanges();  
    mainComponent.posts = [{ id: 1, title: 'Post by newUser' }];
    expect(mainComponent.posts).toEqual(mockPosts);
  });

  

  it('should not add follower if newFollowerName is empty', () => {
    mainComponent.newFollowerName = '';
    mainComponent.addFollower();
    expect(mockRegisterationService.getUser).not.toHaveBeenCalled();
  });

  it('should set error if user already follows the new follower', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Antonette';
    mainComponent.followedUsers = [{ name: 'Antonette' }];
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should set error if the new follower does not exist', () => {
    mainComponent.newFollowerName = 'Peter';
    mockRegisterationService.getUser.and.returnValue(of([]));  // No users found
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });
});
