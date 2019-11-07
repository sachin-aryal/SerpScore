import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ConfigComponent } from './config/config.component';
import { CredentialsComponent } from './credentials/credentials.component';
import {LoginComponent} from "./login/login.component";
import {SignupComponent} from "./signup/signup.component";
import { AuthGuardService } from './services/auth-guard.service';
import {RankComponent} from "./rank/rank.component";

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate : [AuthGuardService]},
  { path: 'home', component: HomeComponent, canActivate : [AuthGuardService]},
  { path: 'config/create', component: ConfigComponent, canActivate : [AuthGuardService]},
  { path: 'config/edit/:id', component: ConfigComponent, canActivate : [AuthGuardService]},
  { path: 'record/details/:id', component: RankComponent, canActivate : [AuthGuardService]},
  { path: 'login', component:LoginComponent},
  { path: 'signup', component:SignupComponent},
  { path: 'credentials/create', component: CredentialsComponent, canActivate : [AuthGuardService]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
