import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  
  constructor( private auth:AuthService, private router:Router){
  }

  user = null;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
    return this.auth.isLoggedIn().pipe(
                                        take(1),
                                        map(user => !!user),
                                        tap( loggedIn => {
                                                            if(!loggedIn){
                                                                        this.router.navigate(['/login']);
                                                                        
                                                                        if(state.url.includes('/invitation/')){                                                                             
                                                                             localStorage.setItem("invitation", state.url.replace('/invitation/', '') )
                                                                        }
                                                                        
                                                                        return false;
                                                            }
                                                          }
                                        )
                                    );

  }  
}