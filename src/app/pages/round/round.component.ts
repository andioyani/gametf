import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import  Swal  from 'sweetalert2';
import { UserService } from '../../services/cloud/user.service';
import { GameService } from '../../services/cloud/game.service';
import { RoundService } from '../../services/cloud/round.service';
import { GameModel, PlayerWinner, PlayerConnected, RoundPlayer, CategoryValue, Round, Player, PlayerRevision } from '../../models/game.model';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms'; 
import { Router } from '@angular/router';

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
  				private userService: UserService,
  				private router:Router) { 

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
  
  private compareData = null;
  
  userId = null;
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
		   				console.log(game);
		   				Swal.close();

		   				if(this.game && this.game.status != "finished"){
						    Swal.fire({
						       allowOutsideClick: false,
						       icon: 'info',
						       text: 'Esperando que se conecten los demas jugadores',
						       confirmButtonText:'Volver al inicio'
						       //text: 'Esperando a los demás jugadores...'
						    }).then((result) => {
							  if (result.value) {
							  	console.log("Bye bye birdie");
							  	this.router.navigate(['/']);
							  }
							});
		   				}

					    //Swal.showLoading()

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
									let main = this;

		   							//Calcular puntajes
		   							this.roundsPlayers.forEach(
		   								(roundPlayer:Round) => {
		   										let id = roundPlayer.uid;
		   										let points = 0;
		   										let roundSave:Round = roundPlayer;

		   										roundPlayer.roundPlayer.forEach(
		   											(round:RoundPlayer) => {
		   												round.categories.forEach(
		   													(roundCat:CategoryValue)=>{
		   														points+=roundCat.points;
		   													}
		   												);
		   											}
		   										);

		   										roundSave.points = points;
		   										this.roundService.create(roundSave);		   										
		   								}
		   							);

		   						}
		   						else{
									this.game.current++;
		   						}
		   						
		   						this.gameService.updateGame(this.game, statusGame);		   						 
		   					}
		   				}

		   				this.startGame = startGame;

		   				if(this.game && (startGame || this.game.status == 'finished') ){	
		   					this.roundData = this.roundService.get(this.game.uid +"_"+ this.userId).subscribe(
		   						(round:Round ) => {
		   									this.round = round;	
		   									console.log(this.round);		
		   								}
		   					);

		   					this.compareData = this.roundService.getCompare(this.game.uid).subscribe(
		   						(roundsPlayers) => {
		   											this.roundsPlayers = roundsPlayers;

		   											if(this.game.status == 'finished'){
		   												let winner:PlayerWinner[] = [];
		   												let maxPoints = 0;

														this.roundsPlayers.forEach(
															(player) => {																
																console.log(player);
																
																if(player.points > maxPoints){
																	maxPoints = player.points;
																}

															}
														)
														
														this.roundsPlayers.filter(function(item, i){
															if(item.points == maxPoints){
																winner.push({name:item.name, photo:item.photo, points:item.points});
															}
														});												

		   												console.log(winner);														
														
														if(!this.game.winner){		
															this.game.winner = winner;
															this.gameService.updateGame(this.game, null);
														}
														
		   											}

		   											
		   										}
		   					);


		   					Swal.close();

		   					if(this.game.status == 'online'){
								let timerInterval
								Swal.fire({
								  title: 'Preparados!',
								  html: 'La ronda comienza en <b></b> segundos.',
								  timer: 5000,
								  timerProgressBar: true,
								  onBeforeOpen: () => {
								    Swal.showLoading()
								    timerInterval = setInterval(() => {
								      const content = Swal.getContent()
								      if (content) {
								        const b = content.querySelector('b')
								        if (b) {
								          var seconds =	((Swal.getTimerLeft() % 60000) / 1000).toFixed(0)
								          b.textContent = seconds.toString()
								        }
								      }
								    }, 100)
								  },
								  onClose: () => {
								    clearInterval(timerInterval)
								  }
								}).then((result) => {
								  /* Read more about handling dismissals below */
								  if (result.dismiss === Swal.DismissReason.timer) {
								    console.log('I was closed by the timer')
								  }
								})
			   					}
		   				}     
		   			}
		   		);   	            	           
	          }
        });
	});
  }

	changeValue(){
		let i = 0;
		this.round.roundPlayer[this.game.current].categories.forEach(
			(roundCategory:CategoryValue) => {											
											if(roundCategory.value && roundCategory.value.trim().length > 1 && roundCategory.value.replace(" ","").length > 1 ){
												this.round.roundPlayer[this.game.current].categories[i].points = 10;
											}
											else{
												this.round.roundPlayer[this.game.current].categories[i].value = null;	
											}

											i++;
			}
		);	

		this.roundService.create(this.round);
	}

  ngOnDestroy(){
  	if(this.routeSubscribe)
  		this.routeSubscribe.unsubscribe();
  	if(this.gameData)
  		this.gameData.unsubscribe();  	
  	if(this.loggedData)
	  	this.loggedData.unsubscribe();
  	if(this.roundData)
	  	this.roundData.unsubscribe();
  	if(this.compareData)
  		this.compareData.unsubscribe();

  	let i = 0;
	this.game.connected.forEach(
		(conn) => {

			if(conn.uid == this.userId  ){
				this.game.connected[i].status = false;
				this.gameService.updateGame(this.game, null);
			}

			i++;
		}
	);	

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
		console.log("Testeando");

		let main = this;
		let response = false;

		this.game.revision.filter(
			function(item, i){
				if(item.uid == main.userId && item.status ){
					response = true;
				}
			}
		);

  		return response;
  	}

  	revisionApprove(round:Round, index:number, player:number){
  		let status = round.roundPlayer[this.game.current].categories[index].revision[player].approved;

		round.roundPlayer[this.game.current].categories[index].revision[player].approved = (status) ? false : true;

		let players:number = 0;
		let playersApprove:number = 0;
		let playersDissapprove:number = 0;

		round.roundPlayer[this.game.current].categories[index].revision.forEach(
			(playersRevision:PlayerRevision) => {
												players++;

												if(playersRevision.approved){
													playersApprove++;
												}
												else{
													playersDissapprove++;
												}
			}
		);

		round.roundPlayer[this.game.current].categories[index].points = (playersDissapprove >= players) ? 0 : 10;		

		this.roundService.create(round);

  	}

}