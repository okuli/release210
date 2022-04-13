import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUserData } from 'src/app/models/userData';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private _service = environment.configServer;

  // private _loginUserUrl = this._service + "user/login";
  public isLogged: boolean = false;
  constructor(private _http: HttpClient) { }

  public loginAdmin(user: IUserData): boolean {
    // return this._http.post<any>(this._loginUserUrl, user);

    if (user.username == "admin" && user.password == "admin") {
      this.isLogged = true;
      return this.isLogged;
    } else {
      this.isLogged = false;
      return this.isLogged;
    }
  }

  public get isUserLoggedIn(): boolean {
    return this.isLogged;
  }

  public logout(): void {
    this.isLogged = false;
  }
}
