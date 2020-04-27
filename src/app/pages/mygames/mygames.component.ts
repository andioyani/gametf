import { Component, OnInit, OnDestroy} from '@angular/core';
import { GameModel, PlayerConnected, Player } from '../../models/game.model';
import { ActivatedRoute } from '@angular/router';
import  Swal  from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/cloud/user.service';
import { GameService } from '../../services/cloud/game.service';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms'; 
import { Router } from '@angular/router';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-mygames',
  templateUrl: './mygames.component.html'
})
export class MygamesComponent implements OnInit, OnDestroy {

	constructor(
	          private auth:AuthService,
	          private route: ActivatedRoute, 
	          private router:Router, 
	          private userService:UserService, 
	          private gameService:GameService
		) { 
				this.loggedData = this.auth.isLoggedIn().subscribe(
				    (logged) => {
				      if(logged){  
				        this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
				          (userDoc:User) => {
				                            this.playerUser = {uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo};                                
				                            console.log(this.playerUser);
			                            	let id:string = Md5.hashStr(this.playerUser.uid + new Date().toTimeString()).toString();

				                            this.gamesData = this.gameService.listUserGames(this.playerUser).subscribe(
				                                ( list:GameModel[] ) => {
				                                                          console.log(logged);
				                                                          this.listGames = list;
				                                                           
				                                }
				                            );                          
				          }
				        );
				        
				      }
				    });
	}

	loggedData = null;
	userData = null;
	gamesData = null;
	playerUser:Player = null;
	listGames:GameModel[];

  ngOnInit(): void {
  }

  ngOnDestroy(){
    if(this.gamesData)
      this.gamesData.unsubscribe();
    if(this.loggedData)
      this.loggedData.unsubscribe();
    if(this.userData)
      this.userData.unsubscribe();
  }

    deleteGame(game:GameModel){

	    Swal.fire({
	      title: 'Eliminar juego?',
	      text: "Se borrarán todos los datos, desea continuar?",
	      icon: 'warning',
	      showCancelButton: true,
	      confirmButtonColor: '#3085d6',
	      cancelButtonColor: '#d33',
	      confirmButtonText: 'Eliminar',
	      cancelButtonText: 'Cancelar'
	    }).then((result) => {

	      if (result.value) {
	        this.gameService.deleteGame(game).then(
	          (success) => {
	                        Swal.fire(
	                          'Listo!',
	                          'El juego fue eliminado.',
	                          'success'
	                        )
	          }
	        ).catch(
	          (error) => {
	                      console.log(  error);
	          }
	        );
	      }
	    })
  }


}
