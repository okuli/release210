import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './core/services/config.service';
import { IConfigData, IKeycloakConfig } from './models/configData';
import { KeycloakService } from 'keycloak-angular';
@Injectable()
export class AppConfig {

  public config: IConfigData = {
    stompUrl: "",
    serverUrlServer: "",
    ownerId: 0,
    groupId: 0,
    settings: {
      auth: {
        clientId: "",
        clientSecret: "",
        endpointUrl: ""
      },
      sync: {
        channelId: "", // not Need
        endpointUrl: ""
      }
    },
    jitsiDomain: "",
    secret: "",
    aud: "",
    iss: "",
    sub: "",
    byeScreenTimeout: 0,
    noAgentScreenTimeout: 0,
    isRedirectToSurvey: false,
    surveyUrl: ""
  };
  public jitsiConfig: any = null;
  public isConfigFileExists: boolean = false;
  public filePath?: string = ""

  constructor(private _http: HttpClient, private _configService: ConfigService, private _keycloakService: KeycloakService) { }

  public getConfigFilePath() {
    return this.filePath;
  }

  public getIsFileExists() {
    return this.isConfigFileExists;
  }

  public async setIsFileExists() {
    await this.getAppConfigData();
    return this.isConfigFileExists;
  }

  public getJitsiConfig() {
    return this.jitsiConfig;
  }


  public setConfig(data: IConfigData) {
    this.config = data;
  }

  public async load() {
    await this.getJitsiConfigData();
    await this.getAppConfigData();
    await this.initializeKeycloak();
  }

  public async getAppConfigData(): Promise<void> {
    await new Promise((resolve, reject) => {
      this._configService.getConfigData().subscribe((response: any) => {
        this.isConfigFileExists = true;
        this.config = response.config;
        this.filePath = response.filePath;
        this.loadScript();
        resolve(true);
      }, (err) => {
        this.isConfigFileExists = false;
        console.error('Environment file is not set or invalid');
        resolve(true)
      });
    });
  }

  public async getJitsiConfigData(): Promise<void> {
    await new Promise((resolve, reject) => {
      this._http.get("./mnt/res/vterminal-backend/jitsi.params.json").subscribe((jitsiResponse: any) => {
        this.jitsiConfig = jitsiResponse;
        resolve(true);
      }, (err) => {
        let getJitsiConfigFromAssets = this._http.get('./assets/jitsi.params.json');
        getJitsiConfigFromAssets.subscribe((response: any) => {
          this.jitsiConfig = response;
          resolve(true);
        })
      })
    })
  }

  public loadScript(): void {
    let scriptTag = document.createElement('script');
    scriptTag.src = `https://${this.config.jitsiDomain}/external_api.js`;
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  }

  public async initializeKeycloak() {
    await new Promise((resolve, reject) => {
      let configData = {
        config: {
          url: '',
          realm: '',
          clientId: ''
        },
        initOptions: {
          checkLoginIframe: true
        }
      }
      this._configService.getKeycloakConfigData().subscribe((response: IKeycloakConfig) => {
        configData.config.url = response.KEYCLOAK_AUTH_SERVER_URL;
        configData.config.realm = response.KEYCLOAK_REALM;
        configData.config.clientId = response.KEYCLOAK_RESOURCE;
        return resolve(this._keycloakService.init(configData));
      }, (error) => {
        console.log("Not Getting Keycloak Config Data, Setup Default Data");
        return resolve(true);
      })
    });
  }

}
