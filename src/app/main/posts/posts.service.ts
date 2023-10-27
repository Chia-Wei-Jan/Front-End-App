import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private userUrl: string = 'https://jsonplaceholder.typicode.com/users';
  private postUrl: string = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) { 
  }

  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getFromLocalStorage(key: string): any {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }

  getUserById(userId: number): Observable<any> {
    const allUsers = this.getFromLocalStorage('allUsers');
    if (allUsers) {
      const user = allUsers.find((user: any) => user.id === userId);
      return of(user);
    } else {
      return this.http.get<any[]>(this.userUrl).pipe(
        tap(data => {
          this.saveToLocalStorage('allUsers', data);
          return data.find(user => user.id === userId);
        })
      );
    }
  }


  getPostsByIds(ids: number[]): Observable<any[]> {
    const posts = ids.map(id => this.getFromLocalStorage(`posts_${id}`)).filter(Boolean).flat();
    if (posts.length > 0) {
      return of(posts);
    } else {
      return from(ids).pipe(
        mergeMap(id => 
          this.http.get<any[]>(`${this.postUrl}?userId=${id}`).pipe(
            tap(data => this.saveToLocalStorage(`posts_${id}`, data))
          )
        ),
      );
    }
  }
}
