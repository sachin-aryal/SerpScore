import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import {Observable} from 'rxjs/index';
import { map, take } from 'rxjs/operators';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private authService: AuthService ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn.pipe(take(1), map((isLoggedIn: boolean) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }

}
