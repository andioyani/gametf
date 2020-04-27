import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/cloud/user.service';
import { Observable } from 'rxjs';
import  Swal  from 'sweetalert2';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  	isLoggedIn: boolean = false;
  	user:User = null;
  	loggedInData;
  	userServiceData;

	constructor(private auth:AuthService, private router:Router, private userService:UserService) {
	    this.loggedInData = this.auth.isLoggedIn().subscribe(
	      (logged) => {
	        if(logged){
	        	
	        	this.userServiceData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
	        		(user:User) => {
	        			this.user = user;
	        		}
	        	);
	        	
	        	this.isLoggedIn = true;
	        }
	      }
	    );       	    
	 }
	
	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.loggedInData.unsubscribe();
		this.userServiceData.unsubscribe();
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
        	this.isLoggedIn = false;
	        this.router.navigate(["/login"]);
	      }
	    })
  	}

}
