import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { SigninComponent } from './components/signin/signin.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/home' },
];
