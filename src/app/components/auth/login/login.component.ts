import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { IUserData } from 'src/app/models/userData';
@Component({
  selector: 'devt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loading: boolean = false;
  public submitted: boolean = false;
  public loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });


  constructor(public authService: AuthService,
    public toastrService: ToastrService,
    private _router: Router) {
  }

  public ngOnInit(): void {
    console.log("");

  }

  public onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    let user: IUserData = {
      username: this.loginForm.controls.username.value,
      password: this.loginForm.controls.password.value
    }
    let data = this.authService.loginAdmin(user);
    if (data) {
      this._router.navigate(['/admin']);
    } else {
      this.toastrService.error('', "Username or password invalid", {
        timeOut: 3000,
        closeButton: true
      });
    }
  }
}
