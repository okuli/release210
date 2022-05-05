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
  private _getKeycloakConfigData = environment.configServer + "config/keycloak";

  constructor(private _http: HttpClient) { }

  public getKeycloakConfigData() {
    return this._http.get<any>(this._getKeycloakConfigData);
  }

  public getConfigData() {
    return this._http.get<any>(this._getConfigData);
  }

  public setConfigData(data: IConfigData) {
    return this._http.post<any>(this._setConfigData, { config: data });
  }
}
