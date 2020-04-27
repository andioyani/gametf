import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { GameModel, PlayerConnected, Player } from '../../models/game.model';
import  Swal  from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/cloud/game.service';
import { UserService } from '../../services/cloud/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html'
})
export class InvitationComponent implements OnInit, OnDestroy {

  	constructor(
  				private route: ActivatedRoute, 
  				private router: Router, 
		        private gameService:GameService,
		        private userService:UserService,
		        private auth:AuthService

				) { }

	private routeSubscribe = null;
	private gameSubscribe = null;
	private loggedData = null;
	private userData = null;
	id = null;

	ngOnInit(): void {		

		this.routeSubscribe = this.route.params.subscribe(params => {
	   		this.id = params['id'];

		    Swal.fire({
		       allowOutsideClick: false,
		       icon: 'info',
		       text: 'Validando invitación... espere unos segundos.'
		    });

		    Swal.showLoading();


			this.loggedData = this.auth.isLoggedIn().subscribe(

			    (logged) => {
			    	let main = this;
			    	if(logged){  
				        this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
				          
				          (userDoc:User) => {

          						   		this.gameSubscribe = this.gameService.getGameData(this.id).subscribe(
								   			(game:GameModel) => {
								   				if(game){
								   					if(game.current == 0){
								   						let player:Player = {uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo};
								   						let playerConnected:PlayerConnected = {uid:userDoc.uid, name:userDoc.name, status:false};
								   						let create = true;

								   						game.players.filter(function(item, i){
								   							if(item.uid == player.uid){
								   								create = false;
								   								Swal.close();

							   								    Swal.fire({
															       allowOutsideClick: false,
															       icon: 'info',
															       text: 'Ya está anotado en este juego.',
															       confirmButtonText: 'Ir a Mis Juegos'
															    }).then((result) => {
																  if (result.value) {																  	
																  	main.router.navigate(['/mygames']);
																  }
																});
								   							}
								   						})

								   						if(create){
									   						game.players.push(player);
	   							                            game.connected.push(playerConnected);
								                            game.revision.push(playerConnected);

								                            this.gameService.createGame(game);								   							
								   						}
								   						
								   					}
								   					else{
						   								Swal.close();
					   								    Swal.fire({
													       allowOutsideClick: false,
													       icon: 'error',
													       text: 'No puede inscribirse en un juego ya comenzado.',
													       confirmButtonText: 'Ir a Mis Juegos'
													    }).then((result) => {
														  if (result.value) {																  	
														  	main.router.navigate(['/mygames']);
														  }
														});
								   						console.log("You can't");
								   					}
								   				}
								   				else{
					   								Swal.close();
					   								    Swal.fire({
													       allowOutsideClick: false,
													       icon: 'error',
													       text: 'El código del juego no es válido.',
													       confirmButtonText: 'Ir a Mis Juegos'
													    }).then((result) => {
														  if (result.value) {																  	
														  	main.router.navigate(['/mygames']);
														  }
														});

								   				}
								   			}
          						   		);
				          }
				        );
			    	}
			    }
			);
		});
	}

	/*

					   		this.gameSubscribe = this.gameService.getGameData(this.id).subscribe(
					   			(game:GameModel) => {
					   				if(game){
					   					if(game.current == 0){
					   						console.log("Yes you can :)");

					   					}
					   					else{
					   						console.log("You can't");
					   					}
					   				}
					   				else{

					   				}
					   				//console.log("Game?");	
					   				//console.log(game);	
					   			}
					   		);
					   	});
	*/



	ngOnDestroy(): void{
		if(this.routeSubscribe)
	  		this.routeSubscribe.unsubscribe();
		if(this.gameSubscribe)
	  		this.gameSubscribe.unsubscribe();
		if(this.loggedData)
	  		this.loggedData.unsubscribe();
		if(this.userData)
	  		this.userData.unsubscribe();

	}

}
