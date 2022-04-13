import { Component } from '@angular/core';
import { LocalizationService } from './core/services/localization.service';

@Component({
  selector: 'devt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'vTerminal';

  constructor(
    private _localizationService: LocalizationService) {
    this._localizationService.setDefaultLanguage("en");
  }
}
