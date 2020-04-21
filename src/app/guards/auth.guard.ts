import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  
  constructor( private auth:AuthService, private router:Router){
  }

  user = null;

  canActivate(): Observable<boolean> | Promise<boolean> | boolean{
    return this.auth.isLoggedIn().pipe(
                                        take(1),
                                        map(user => !!user),
                                        tap( loggedIn => {
                                                            if(!loggedIn){
                                                                        this.router.navigate(['/login']);
                                                                        localStorage.removeItem("showNavigation");
                                                            }
                                                            else{
                                                              localStorage.setItem("showNavigation", "true")
                                                            }
                                                          }
                                        )
                                    );

  }  
}