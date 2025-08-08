import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { MovieDetailComponent } from './components/movie-detail/movie-detail';
import { SearchComponent } from './components/search/search';
import { AboutComponent } from './components/about/about';
import { ContactComponent } from './components/contact/contact';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { PersonalInfoComponent } from './components/personal-info/personal-info';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'movie/:id', component: MovieDetailComponent },
  { path: 'search', component: SearchComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'personal-info', component: PersonalInfoComponent },
  { path: '**', redirectTo: '/home' }
];
