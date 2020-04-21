import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import  Swal  from 'sweetalert2';
import { UserService } from '../../services/cloud/user.service';
import { GameService } from '../../services/cloud/game.service';
import { RoundService } from '../../services/cloud/round.service';
import { GameModel, PlayerConnected, RoundPlayer, CategoryValue, Round } from '../../models/game.model';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms'; 

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html'
})

export class RoundComponent implements OnInit, OnDestroy {

  constructor(
  				private auth:AuthService, 
  				private route: ActivatedRoute, 
  				private gameService: GameService, 
  				private roundService: RoundService, 
  				private userService: UserService) { 

	    Swal.fire({
	       allowOutsideClick: false,
	       icon: 'info',
	       text: 'Cargando juego, espere por favor'
	    });

	    Swal.showLoading();

  }

  private id: string;
  private routeSubscribe = null;
  private roundData = null;
  private gameData = null;
  private loggedData = null;
  private userId = null;
  private compareData = null;

  round:Round = null;
  roundPlayer:RoundPlayer = null;
  startGame = false;
  roundsPlayers = null;

  game:GameModel = null;

  ngOnInit(): void {
  	
	this.routeSubscribe = this.route.params.subscribe(params => {
   		this.id = params['id'];

   		let main = this;

    	this.loggedData = this.auth.isLoggedIn().subscribe(
	        (logged) => {
	          if(logged){  
	            this.userId = logged.uid;
		   		this.gameData = this.gameService.getGameData(this.id).subscribe(
		   			(game:GameModel) => {	

		   				this.game = game;
		   				let i = 0;
		   				let startGame = true;

		   				this.game.connected.forEach(
		   					(conn) => {

		   						if(conn.uid == this.userId && !conn.status ){
		   							this.game.connected[i].status = true;
		   							this.gameService.updateGame(this.game, null);
		   						}

		   						if(!conn.status){
		   							startGame = false;
		   						}

		   						i++;
		   					}
		   				);	

		   				if(this.game.status == 'revision'){
		   					let update = true;

		   					this.game.revision.forEach(
		   						(rev) => {
		   							if(!rev.status){
		   								update = false;
		   								//break;
		   							}
		   						}
		   					);

		   					if(update){
		   						let statusGame:string = "online";

		   						if((this.game.current+1) >= this.game.rounds){
		   							statusGame = "finished";
		   						}
		   						else{
									this.game.current++;
		   						}
		   						
		   						this.gameService.updateGame(this.game, statusGame);		   						 
		   					}
		   				}

		   				this.startGame = startGame;

		   				if(startGame){	
		   					this.roundData = this.roundService.get(this.game.owner +"_"+ this.userId).subscribe(
		   						(round:Round ) => {
		   									this.round = round;	
		   									console.log(this.round);		
		   								}
		   					);

		   					this.compareData = this.roundService.getCompare(this.game.owner).subscribe(
		   						(roundsPlayers) => {
		   											this.roundsPlayers = roundsPlayers
		   											console.log(this.roundsPlayers);
		   										}
		   					);


		   					Swal.close();

		   				}     
		   			}
		   		);   	            	           
	          }
        });
	});
  }

	changeValue(){
		this.roundService.create(this.round);
		console.log("Change");
	}

  ngOnDestroy(){
  	this.routeSubscribe.unsubscribe();
  	this.gameData.unsubscribe();
  	this.loggedData.unsubscribe();
  	this.roundData.unsubscribe();
  	this.compareData.unsubscribe();
  }

  onSubmit(form:NgForm){
  	//this.game.status = "revision";
  	this.roundService.create(this.round);
  	this.gameService.updateGame(this.game, "revision");
  }

  approve(){
  	let main = this;
  	//this.game.status = "online";
  	this.game.revision.filter(
  		function(item, i){
  			if(item.uid == main.userId){
  				main.game.revision[i].status = true;
  			}
  		}
  	);

  	this.gameService.updateGame(this.game, null);
  }

	userApproved(){
		let main = this;
		let response = false;

		this.game.revision.filter(
			function(item, i){
				
				if(item.uid == main.userId && item.status ){
					console.log(item);
					response = true;
				}
			}
		);

  		return response;
  	}

}
