import { Component, HostListener, OnInit } from '@angular/core';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { AppConfig } from '../../../app.config';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../../../core/services/config.service';
import { ToastrService } from 'ngx-toastr';
import { IConfigData } from 'src/app/models/configData';
import { Router } from '@angular/router';
import { LocalizationService } from "../../../core/services/localization.service";
@Component({
  selector: 'devt-app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  public showConfigModal = false;
  public isConfigDataUpdating = false;
  public filePath?: string = "";

  public configData: IConfigData = {
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
        channelId: "",
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

  public form = new FormGroup({
    beraterpoolUrl: new FormControl('', Validators.required),
    beraterpoolServerUrl: new FormControl('', Validators.required),
    beraterpoolOwnerId: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
    beraterpoolGroupId: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
    authSettingsClientId: new FormControl('', Validators.required),
    authSettingsClientSecret: new FormControl('', Validators.required),
    authSettingsTokenUrl: new FormControl('', Validators.required),
    syncSettingsTokenUrl: new FormControl('', Validators.required),
    jitsiDomain: new FormControl('', Validators.required),
    jitsiSecret: new FormControl('', Validators.required),
    jitsiAud: new FormControl('', Validators.required),
    jitsiIss: new FormControl('', Validators.required),
    jitsiSub: new FormControl('', Validators.required),
    byeScreenTimeout: new FormControl(10, [Validators.required, Validators.pattern("^[0-9]*$")]),
    noAgentScreenTimeout: new FormControl(10, [Validators.required, Validators.pattern("^[0-9]*$")]),
    isRedirectToSurvey: new FormControl(false, [Validators.required]),
    surveyUrl: new FormControl('', Validators.required),
    currentLanguage: new FormControl(''),
  });

  constructor(private _keyClockService: KeycloakService,
    public appConfig: AppConfig,
    public configService: ConfigService,
    public toastrService: ToastrService,
    private _router: Router,
    public localizationService: LocalizationService) {
  }

  public ngOnInit(): void {
    this.setDataToForm();
    this._keyClockService.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnTokenExpired) {
          this._keyClockService.updateToken(300);
        }
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  public unloadHandler(event: Event) {
    event.returnValue = false;
  }

  public logout(): void {
    this._keyClockService.logout();
  }

  public setDataToForm(): void {
    if (this.appConfig.getIsFileExists()) {
      this.filePath = this.appConfig.getConfigFilePath();
      this.form.setValue({
        beraterpoolUrl: this.appConfig.config?.stompUrl ? this.appConfig.config.stompUrl : "",
        beraterpoolServerUrl: this.appConfig.config?.serverUrlServer ? this.appConfig.config.serverUrlServer : "",
        beraterpoolOwnerId: this.appConfig.config?.ownerId ? this.appConfig.config.ownerId : 0,
        beraterpoolGroupId: this.appConfig.config?.groupId ? this.appConfig.config.groupId : 0,
        authSettingsClientId: this.appConfig.config?.settings.auth.clientId ? this.appConfig.config.settings.auth.clientId : "",
        authSettingsClientSecret: this.appConfig.config?.settings.auth.clientSecret ? this.appConfig.config.settings.auth.clientSecret : "",
        authSettingsTokenUrl: this.appConfig.config?.settings.auth.endpointUrl ? this.appConfig.config.settings.auth.endpointUrl : "",
        syncSettingsTokenUrl: this.appConfig.config?.settings.sync.endpointUrl ? this.appConfig.config.settings.sync.endpointUrl : "",
        jitsiDomain: this.appConfig.config?.jitsiDomain ? this.appConfig.config.jitsiDomain : "",
        jitsiSecret: this.appConfig.config?.secret ? this.appConfig.config.secret : "",
        jitsiAud: this.appConfig.config?.aud ? this.appConfig.config.aud : "",
        jitsiIss: this.appConfig.config?.iss ? this.appConfig.config.iss : "",
        jitsiSub: this.appConfig.config?.sub ? this.appConfig.config.sub : "",

        byeScreenTimeout: this.appConfig.config?.byeScreenTimeout ? this.appConfig.config.byeScreenTimeout : 0,
        noAgentScreenTimeout: this.appConfig.config?.noAgentScreenTimeout ? this.appConfig.config.noAgentScreenTimeout : 0,
        isRedirectToSurvey: this.appConfig.config?.isRedirectToSurvey ? this.appConfig.config.isRedirectToSurvey : false,
        surveyUrl: this.appConfig.config?.surveyUrl ? this.appConfig.config.surveyUrl : "",
        currentLanguage: this.localizationService.getCurrentLanguage()
      });
    }
  }

  public changeConfigData(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isConfigDataUpdating) {
      return;
    }
    this.isConfigDataUpdating = true;
    let data = JSON.parse(JSON.stringify(this.configData));

    data.stompUrl = this.form.controls.beraterpoolUrl.value;
    data.serverUrlServer = this.form.controls.beraterpoolServerUrl.value;
    data.ownerId = +this.form.controls.beraterpoolOwnerId.value ? +this.form.controls.beraterpoolOwnerId.value : this.form.controls.beraterpoolOwnerId.value;
    data.groupId = +this.form.controls.beraterpoolGroupId.value ? +this.form.controls.beraterpoolGroupId.value : this.form.controls.beraterpoolGroupId.value;
    data.settings = {
      auth: {
        clientId: this.form.controls.authSettingsClientId.value,
        clientSecret: this.form.controls.authSettingsClientSecret.value,
        endpointUrl: this.form.controls.authSettingsTokenUrl.value
      },
      sync: {
        channelId: "",
        endpointUrl: this.form.controls.syncSettingsTokenUrl.value
      }
    };
    data.jitsiDomain = this.form.controls.jitsiDomain.value;
    data.secret = this.form.controls.jitsiSecret.value;
    data.aud = this.form.controls.jitsiAud.value;
    data.iss = this.form.controls.jitsiIss.value;
    data.sub = this.form.controls.jitsiSub.value;
    data.byeScreenTimeout = +this.form.controls.byeScreenTimeout.value ? +this.form.controls.byeScreenTimeout.value : this.form.controls.byeScreenTimeout.value;
    data.noAgentScreenTimeout = +this.form.controls.noAgentScreenTimeout.value ? +this.form.controls.noAgentScreenTimeout.value : this.form.controls.noAgentScreenTimeout.value;
    data.isRedirectToSurvey = this.form.controls.isRedirectToSurvey.value;
    data.surveyUrl = this.form.controls.surveyUrl.value;

    this.configService.setConfigData(data).subscribe((response: any) => {
      this.isConfigDataUpdating = false;
      this.appConfig.setIsFileExists();
      this.filePath = response.filePath;
      this.toastrService.success('', 'Config data updated.', {
        timeOut: 3000,
        closeButton: true
      });
    }, (err: any) => {
      console.log("err", err);
      this.isConfigDataUpdating = false;
      this.toastrService.error('', 'Config data not updated. Please try again.', {
        timeOut: 3000,
        closeButton: true
      });
    });

  }

  public redirectToTranslations(): void {
    this._router.navigate(['/admin/translation']);
  }

  public changeLanguage(event: any) {
    this.localizationService.setDefaultLanguage(event.target.value)

  }
}

