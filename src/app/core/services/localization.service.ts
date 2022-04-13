import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {

  constructor(private _translateService: TranslateService) { }

  public setDefaultLanguage(language: string) {
    this._translateService.setDefaultLang(language);
  }

  public changeCurrentLanguage(language: string) {
    this._translateService.use(language);
  }

  public getCurrentLanguage() {
    return this._translateService.store.currentLang ? this._translateService.store.currentLang : this._translateService.store.defaultLang;
  }
}
