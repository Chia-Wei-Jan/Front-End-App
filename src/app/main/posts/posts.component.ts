import { Component, Input, OnInit } from '@angular/core';

interface Post {
  id: number;
  title: string;
  authorName: string;
  body: string;
  timestamp: Date;
}

@Component({
  selector: 'app-post',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent{
  
  @Input() post: any;

  showComment: boolean = false; 
  newComment: string = ''; 

  addComment(comment: string): void {
    // if (!this.post.comments) {
    //   this.post.comments = [];
    // }
    // this.post.comments.push({ content: comment });
  }

  editPost(postId: number): void {
    // console.log(postId);
  }

  submitComment(postId: number, comment: string): void {
    // console.log(postId, comment);
  }
}