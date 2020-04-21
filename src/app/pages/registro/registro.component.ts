import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { NgForm } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/cloud/user.service';

import { Router } from '@angular/router';
import  Swal  from 'sweetalert2';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html'
})
export class RegistroComponent implements OnInit, OnDestroy {
  user:UserModel;
  remember:boolean = false;
  loggedIn;

  constructor(private auth:AuthService, private router: Router, private userService:UserService) { 
    this.loggedIn = this.auth.isLoggedIn().subscribe(
      (logged) => {
        if(logged)
          this.router.navigateByUrl("/home");
      }
    );     
  }

  ngOnInit() { 	
  	this.user = new UserModel(); 
  }

  ngOnDestroy(){
    this.loggedIn.unsubscribe();
  }

  onSubmit(form:NgForm){
  	if(form.invalid){ return; }
     Swal.fire({
       allowOutsideClick: false,
       icon: 'info',
       text: 'Espere por favor'
     });

     Swal.showLoading();

    
    this.auth.registerEmail(this.user).then(
      (response) => {
        console.log(response);

        let user = {
                    name:this.user.name, 
                    uid:response.user.uid,
                    photo:response.user.photoURL,
                    email:response.user.email
                  };

        this.userService.createUser(user);
        Swal.close();

        //UPDATE USER

        this.router.navigateByUrl('/home');
      })
      .catch(
      (err) => {
        console.log(err)
        let text = (err.code == "auth/email-already-in-use") ? "El email ya está registrado!" : "No se ha podido crear el usuario.";

        Swal.fire({
           icon: 'error',
           text: text
         });

      }
    );
  }


}
