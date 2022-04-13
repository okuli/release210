import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'devt-call-end',
  templateUrl: './call-end.component.html',
  styleUrls: ['./call-end.component.scss']
})
export class CallEndComponent implements OnInit {

  public timeout = 0;

  constructor(private _router: Router, public appConfig: AppConfig) {
    this.timeout = this.appConfig.config?.byeScreenTimeout;
  }


  public ngOnInit(): void {
    setTimeout(() => {
      this._router.navigate(['/connect-call']);
    }, this.timeout * 1000);
  }

}
