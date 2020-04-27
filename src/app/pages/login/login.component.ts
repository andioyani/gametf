import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { NgForm } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { UserService } from '../../services/cloud/user.service';
import { User } from '../../models/user.model';

import  Swal  from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
	user:UserModel;
  loggedIn;
  constructor(  private route: ActivatedRoute,
                private auth:AuthService, 
                private router: Router, 
                private userService:UserService) { }

  ngOnInit() {

    this.loggedIn = this.auth.isLoggedIn().subscribe(
      (logged) => {
        if(logged){
          if(localStorage.getItem("invitation")){
            console.log("Redirect to invitation");
            this.router.navigateByUrl('/invitation/' + localStorage.getItem("invitation"));                                  
            localStorage.clear();
          }
          else{
            this.router.navigate(['/home']);                      
          }
        }
      }
    );       

  	this.user = new UserModel();
  }

  ngOnDestroy() {
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
       
      this.auth.loginEmail(this.user).then(
        (response) => {
          console.log(response);
          Swal.close();

        })
      .catch(
        (err) => {
          console.log(err);
          let text = (err.code == "auth/user-not-found") ? "El usuario no existe." : "Vuelva a intentarlo.";

          Swal.fire({
             icon: 'error',
             text: text
           });
        }
      );
  }

  loginProvider(provider:string){
    this.auth.loginProvider(provider).then(
        (success) => {    
          //console.log(success.user.displayName);
          //Check if user exists, if so do nothing, else create it
          let user = {
                      name:success.user.displayName, 
                      uid:success.user.uid,
                      photo:success.user.photoURL,
                      email:success.user.email
                    };

          this.userService.createUser(user);
          
          
        }
    ).catch(
        (err) => { 
          
          let text = (err.code == "auth/account-exists-with-different-credential") ? "Ya existe otra cuenta asociada a este email." : "Contacte al administrador.";
          console.log(text) 

          Swal.fire({
             icon: 'error',
             text: text
           });

        }
    );
  }

}
