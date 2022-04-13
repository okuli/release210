import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallEndComponent } from './call-end/call-end.component';
import { ConnectCallComponent } from './connect-call/connect-call.component';
import { DisplayVersionComponent } from './display-version/display-version.component';

const routes: Routes = [
  { path: '', redirectTo: 'connect-call', pathMatch: 'full' },
  { path: 'connect-call', component: ConnectCallComponent },
  { path: 'call-end', component: CallEndComponent },
  { path: 'app-version', component: DisplayVersionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
