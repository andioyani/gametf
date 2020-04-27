import { Component, OnInit} from '@angular/core';
import { Player } from '../../models/game.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/cloud/user.service';
import  Swal  from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  constructor(
              private auth:AuthService,
              private userService:UserService, 
              private router:Router, 
              ) { 
                  this.loggedData = this.auth.isLoggedIn().subscribe(
                      (logged) => {
                        if(logged){  
                          this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
                            (userDoc:User) => {
                                              this.playerUser = {uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo};                                                                              
                            }
                          );
                          
                        }
                      });
  }

  loggedData = null;
  userData = null;
  gamesData = null;
  playerUser:Player = null;

  ngOnInit(){
  }


  logout(){
      Swal.fire({
        title: 'Salir de la App?',
        text: "Está seguro que desea salir?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Salir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          this.auth.logOut();          
          //this.isLoggedIn = false;
          this.router.navigate(["/login"]);
        }
      })
  }

}