import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConfigData } from 'src/app/models/configData';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _getConfigData = environment.configServer + "config/data";
  private _setConfigData = environment.configServer + "config/data";

  constructor(private _http: HttpClient) { }

  public getConfigData() {
    return this._http.get<any>(this._getConfigData);
  }

  public setConfigData(data: IConfigData) {
    return this._http.post<any>(this._setConfigData, { config: data });
  }
}
