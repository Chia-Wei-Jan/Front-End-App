import { Component, OnInit } from '@angular/core';
import { PostService } from './posts/posts.service';
import { RegisterationService } from '../auth/registeration/registeration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit {

  headline: string = 'To be or not to be, that is a question';
  newHeadline: string = ''; 
  avatarUrl: string = 'https://brand.rice.edu/sites/g/files/bxs2591/files/2019-08/190308_Rice_Mechanical_Brand_Standards_Logos-2.png'; // Assuming a local path; replace with actual path


  posts: any[] = []; // Store the posts
  user: any;
  username: string = '';
  userId: any;

  newPostTitle: string = '';
  newPostContent: string = '';

  searchKeyword: string = '';
  filterPost: any[] = [];

  followedUsers: any[] = [];
  newFollowerName: string = '';
  imageBtnClick: boolean = false;
  catchPhrases: string[] = [
    'Bridging the gap.',
    'A touch of genius.',
    'Accelerate your world.',
    'Driven by passion.',
    'Think different.',
    'Making a difference.',
    'Future is now.',
    'Beyond boundaries.',
    'Innovate, integrate, captivate.',
    'Excellence in action.',
    'Change the world.',
    'Inspiration comes standard.',
    'Reach for the skies.',
    'Redefining possibilities.',
    'Breaking barriers.',
    'Pushing the limits.',
    'Challenge everything.',
    'Imagine. Innovate. Inspire.',
    'Simplicity is the ultimate sophistication.',
    'We make dreams a reality.'
  ];


  defaultHeadline: string = 'Default follower headline!';

  selectImage: File | null = null;
  newUser: boolean = false;
  allUsers: any[] = [];
  addFollowerErrorMessage: String = '';

  currentDate = new Date('2023-10-13');

  showComment: boolean = false; 
  newComment: string = ''; 

  comments: string[] = [
    "Amy: Wow, this really brings back memories.",
    "John: Congratulations on your achievement!",
    "Sophia: Keeping you in my thoughts and prayers.",
    "Ethan: Your photos are always so captivating.",
    "Liam: The kids have grown so much! They look wonderful.",
    "Olivia: This genuinely made me laugh out loud.",
    "Emma: Interesting post! Could you share the source?",
    "Noah: It's been ages! We should definitely reconnect soon.",
    "Ava: I feel this on a personal level.",
    "James: Wishing you a joyous birthday and many happy returns.",
    "Charlotte: Stunning scenery! Where was this taken?",
    "Mia: Your style is impeccable. Where did you buy that outfit?",
    "Elijah: I appreciate the suggestion. I'll give it a try.",
    "Lucas: Missing our times together. Hope we can meet up soon.",
    "Harper: Thank you for sharing this. It's truly impactful.",
    "Aiden: Funny enough, I was pondering the same thing recently.",
    "Emily: Sending warm wishes your way.",
    "Daniel: It's amazing how quickly time passes.",
    "Grace: That dish looks scrumptious! Mind sharing the recipe?",
    "Benjamin: Your accomplishments never cease to amaze me."
  ];


  constructor(private postService: PostService, private registerationService: RegisterationService, private router: Router) {}  // Inject the PostService

  ngOnInit(): void {
    this.setupCurrentUser();
  }

  private setupCurrentUser(): void {
      const currentUser = this.registerationService.getCurrentUser();

      if(!currentUser.id) {  // New user does not have ID
          this.username = currentUser.username;
          const loadHeadline = localStorage.getItem('headline');
          this.headline = loadHeadline || '';
      } else {
          this.fetchAllUsers();
          this.fetchCurrentUserDetails(currentUser.id);
          this.setupUserPosts(currentUser.id);
          this.setupFollowedUsersPosts(currentUser.id);
      }
  }

  private fetchAllUsers(): void {
      this.registerationService.getUser().subscribe(users => {
          this.allUsers = users;
      });
  }

  private fetchCurrentUserDetails(userId: number): void {
      if(localStorage.getItem('headline')) {
        localStorage.removeItem('headline');
      }
      this.postService.getUserById(userId).subscribe(data => {
          this.user = data;
          this.username = data.username;
          this.headline = data.company.catchPhrase;
          this.userId = data.id;
      });
  }

  private setupUserPosts(userId: number): void {
      this.postService.getPostsByIds([userId]).subscribe(posts => {
          this.initializePosts(posts);
      });
  }

  private setupFollowedUsersPosts(userId: number): void {
      this.registerationService.getFollowedUsers(userId).subscribe(followedUsers => {
          if (followedUsers && followedUsers.length > 0) {
              this.followedUsers = followedUsers.map(user => ({
                  ...user,
                  avatar: this.getRandomAvatar()
              }));

              const followedIds = this.followedUsers.map(user => user.id);
              
              this.postService.getPostsByIds(followedIds).subscribe(followedUserPosts => {
                  this.initializeFollowedUsersPosts(followedUserPosts);
              });
          } else {
              this.followedUsers = [];
          }
      });
  }

  private initializePosts(posts: any[]): void {
      let currentDate = new Date('2023-10-12');

      if (posts && posts.length > 0) {
          this.posts = posts;

          this.posts.forEach((post, index) => {
              post.image = this.getRandomImage();
              post.comments = this.getRandomComment();
              post.timestamp = new Date(currentDate);
              this.postService.getUserById(post.userId).subscribe(author => {
                  post.authorName = author.username;
              });
              currentDate.setDate(currentDate.getDate() - 1);
          });
      } else {
          this.posts = [];
      }

      this.searchPost();
  }

  private initializeFollowedUsersPosts(followedUserPosts: any[]): void {
      let currentDate = new Date('2023-10-12');

      if (followedUserPosts && followedUserPosts.length > 0) {
          this.posts = [...this.posts, ...followedUserPosts];
          this.filterPost = [...this.posts];

          followedUserPosts.forEach(post => {
              post.image = this.getRandomImage();
              post.timestamp = new Date(currentDate);
              this.postService.getUserById(post.userId).subscribe(author => {
                  post.authorName = author.username;
              });

              currentDate.setDate(currentDate.getDate() - 1);
          });
      }
  }


  setLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }

  removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  updateHeadline(): void {
    if (this.newHeadline.trim()) {
      this.headline = this.newHeadline.trim();
      localStorage.setItem('headline', JSON.stringify(this.headline));
      this.newHeadline = '';
      // Retrieve the users from local storage
      const storedUsers = localStorage.getItem('allUsers');
      if (storedUsers) {
          const users = JSON.parse(storedUsers);

          // Find the user with the given userId
          const userToUpdate = users.find((user: any) => user.id === this.userId);

          if (userToUpdate) {
              userToUpdate.company.catchPhrase = this.headline.trim();
              localStorage.setItem('allUsers', JSON.stringify(users));
          }
      }
    }
  }

  uploadImage(event: Event): void {
    const input = event?.target as HTMLInputElement;
    if(input.files && input.files[0]) {
      this.selectImage = input.files[0];
    }
  }
  addFollower(): void {
    this.addFollowerErrorMessage = '';
    if (!this.newFollowerName.trim()) {
      return;
    }
    if (this.newFollowerName.trim()) {

      const currentUser = this.registerationService.getCurrentUser();
      if(this.newFollowerName.trim() === currentUser.username.trim()) {
        this.addFollowerErrorMessage = 'You cannot follow yourself!';
      }

      this.registerationService.getUser().subscribe(users => {
        const addedUser = users.find(user => user.username === this.newFollowerName.trim());
        
        if (addedUser && addedUser.company && addedUser.company.catchPhrase) {
          if (this.followedUsers.some(user => user.name === addedUser.name)) {
            this.addFollowerErrorMessage = 'You already follow this user!';
            return;
          }

          const newFollower = {
            id: addedUser.id,
            username: addedUser.username,
            headline: addedUser.company.catchPhrase,
            avatar: this.getRandomAvatar()
          };
          this.followedUsers.unshift(newFollower);

          console.log(this.followedUsers);

         // let currentDate = new Date('2023-10-12');
          
          this.postService.getPostsByIds([addedUser.id]).subscribe(posts => {
            this.currentDate.setDate(this.currentDate.getDate() + 10);

            posts.forEach(posts => {
              posts.image = this.getRandomImage();
              posts.timestamp = new Date(this.currentDate);;
              posts.authorName = newFollower.username;
              posts.comments = this.getRandomComment();
            this.currentDate.setDate(this.currentDate.getDate() - 1);
            });

            this.currentDate.setDate(this.currentDate.getDate() + 10);

            this.posts = [...posts, ...this.posts];
            this.filterPost = [...this.posts];
          });
          this.newFollowerName = '';
          this.addFollowerErrorMessage = '';
        }
        else {
          this.addFollowerErrorMessage = 'User does not exist!';
          this.newFollowerName = '';
        }
        console.log(this.filterPost.length);
      });      
    }
  }


  getCatchPhrase(): string {
    const index = Math.floor(Math.random() * this.catchPhrases.length);
    return this.catchPhrases[index];
  }

  unfollowUser(index: number): void {
    const unfollowUserId = this.followedUsers[index].id;

    this.followedUsers.splice(index, 1);

    this.posts = this.posts.filter(post => post.userId != unfollowUserId);
    this.filterPost = [...this.posts];
  }

  getRandomImage(): string {
    return `https://picsum.photos/800/300?random=${Math.random()}`;
  }

  getRandomAvatar(): string {
    return `https://picsum.photos/200/300?random=${Math.random()}`;
  }

  getRandomComment(): string[] {
    let randomComment: string[] = [];
    for (let i = 0; i < 3; i++) {
      const index = Math.floor(Math.random() * this.comments.length);
      randomComment.push(this.comments[index]);
    }
    return randomComment;
  }

  uploadImageBtn(): void {
    console.log('ture')
    this.imageBtnClick = true;
  }

  submitPost(): void {
    if(this.newPostTitle.trim() && this.newPostContent.trim()) {
      const latestPostDate = this.posts[0]?.timestamp || new Date('2023-10-12');
      const newPostDate = new Date(latestPostDate);
      newPostDate.setDate(newPostDate.getDate() + 1);

      const newPost: {
        title: string;
        body: string;
        authorName: string;
        timestamp: Date;
        image: string | null;
        comments: any[];
      } = {
        title: this.newPostTitle,
        body: this.newPostContent,
        authorName: this.username,
        timestamp: newPostDate,
        image: this.getRandomImage(),
        comments: []
      }
      
      if(!this.imageBtnClick) {
        newPost.image = null;
      }
      else {
        newPost.image = this.getRandomImage();
      }

      console.log(newPost);

      this.filterPost.unshift(newPost);
      this.posts.unshift(newPost);

      this.newPostTitle = '';
      this.newPostContent = '';
      this.imageBtnClick = false;
    }
  }


  searchPost(): void { 
    if(this.searchKeyword) {
      const tolowerSearchKeyword = this.searchKeyword.toLocaleLowerCase();
      this.filterPost = this.posts.filter(post => 
        post.authorName && post.authorName.toLocaleLowerCase().includes(tolowerSearchKeyword) || post.body && post.body.toLocaleLowerCase().includes(tolowerSearchKeyword)
      );
    }
    else {
      this.filterPost = [...this.posts];
    }
  }

  clearPost(): void {
    this.newPostTitle = '';
    this.newPostContent = '';
  }

  editPost(postId: number): void {
    console.log('Editing post with ID:', postId);
  }

  commentPost(postId: number): void {
    console.log('Commenting on post with ID:', postId);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.registerationService.clearCurrentUser();

    if(localStorage.getItem('headline')) {
      localStorage.removeItem('headline');
    }
    this.router.navigate(['\auth']);
  }

}