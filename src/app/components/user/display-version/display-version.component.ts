import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'devt-display-version',
  templateUrl: './display-version.component.html',
  styleUrls: ['./display-version.component.scss']
})
export class DisplayVersionComponent implements OnInit {

  public appVersion: string = "";
  constructor() { }

  public ngOnInit(): void {
    this.appVersion = environment.appVersion;
  }

}
