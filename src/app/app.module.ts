import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from "@angular/router";
import { ConnectCallComponent } from './components/user/connect-call/connect-call.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserAgentDetailsComponent } from './components/user/user-agent-details/user-agent-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallEndComponent } from './components/user/call-end/call-end.component';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LocalizationService } from "./core/services/localization.service";
import { KeycloakAngularModule } from 'keycloak-angular';
import { ConfigComponent } from './components/admin/config/config.component';
import { AtlasUIModule } from '@syncpilot/atlas-ui';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { DisplayVersionComponent } from './components/user/display-version/display-version.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '',
    loadChildren: () => import('./components/user/user.module').then(m => m.UserModule)
  }
]

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    ConnectCallComponent,
    UserAgentDetailsComponent,
    CallEndComponent,
    DisplayVersionComponent,
    ConfigComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AtlasUIModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    KeycloakAngularModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    AppConfig,
    LocalizationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
      deps: [AppConfig],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
