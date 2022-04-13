import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MissingTranslationHandler, TranslateCompiler, TranslateLoader, TranslateModule, TranslateParser, TranslateService, TranslateStore, USE_DEFAULT_LANG, USE_STORE } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AtlasUIModule } from '@syncpilot/atlas-ui';
import { KeycloakService } from 'keycloak-angular';
import { ToastrModule } from 'ngx-toastr';
import { AppConfig } from '../../../app.config';
import { LocalizationService } from '../../../core/services/localization.service';

import { ConfigComponent } from './config.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../../../assets/i18n/', '.json');
}

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigComponent],
      imports: [
        AtlasUIModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        }),
      ],
      providers: [
        KeycloakService,
        AppConfig,
        HttpClient,
        HttpHandler,
        LocalizationService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
