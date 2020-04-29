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
  
  showResults = false;
  userId = null;
  round:Round = null;
  roundPlayer:RoundPlayer = null;
  startGame = false;
  roundsPlayers = null;
  waiting = true;

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
							this.waiting = true;						
		   				}

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
		   					this.waiting = false;
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
		   						}
		   						else{
									this.game.current++;
		   						}
		   						
		   						this.gameService.updateGame(this.game, statusGame);		   						 
		   					}
		   				}

		   				this.startGame = startGame;

		   				if(this.game && (startGame || this.game.status == 'finished') ){
		   					this.showResults = false;
						    this.waiting = false;

		   					this.roundData = this.roundService.get(this.game.uid +"_"+ this.userId).subscribe(
		   						(round:Round ) => {
		   									console.log("Ronda");
		   									this.round = round;	
		   									console.log(this.round);		
		   								}
		   					);

		   					this.compareData = this.roundService.getCompare(this.game.uid).subscribe(
		   						(roundsPlayers) => {
		   											this.roundsPlayers = roundsPlayers;

		   											this.roundsPlayers.points = 0;
													
		   											let i = 0;

		   											this.roundsPlayers.forEach(

		   												(roundPlayer) => {
															this.roundsPlayers[i].points = 0;
		   													
		   													roundPlayer.roundPlayer.forEach(
		   														(categoryRound) => {

		   															categoryRound.categories.forEach(
		   																(categoryValue) => {
		   																	this.roundsPlayers[i].points+= categoryValue.points;
		   																}
		   															);

		   															
		   														}
		   													);
															i++;
		   												}
		   											);

		   											console.log(roundsPlayers);
		   										}
		   					);
							

		   					//Swal.close();

		   					if(this.game.status == 'online'){

								let timerInterval
								Swal.fire({
								  title: 'Preparados!',
								  html: 'La ronda comienza en <b></b> segundos.',
								  timer: 3000,
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
								    clearInterval(timerInterval);
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

	showResultsChange(show:boolean){
		this.showResults = show;
	}

	changeValue(){
		let i = 0;
		let letterCurrent = this.game.letters[this.game.current];

		this.round.roundPlayer[this.game.current].categories.forEach(
			(roundCategory:CategoryValue) => {	
											let value = (roundCategory.value) ? roundCategory.value.trim() : null;

											if(value && value.length > 1 && value.replace(" ","").length > 1 && value.charAt(0).toUpperCase() == letterCurrent ){
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
	    Swal.fire({
	      title: 'Basta para mi!!!',
	      text: "Seguro de terminar la ronda?",
	      icon: 'warning',
	      showCancelButton: true,
	      confirmButtonColor: '#3085d6',
	      cancelButtonColor: '#d33',
	      confirmButtonText: 'Seguro',
	      cancelButtonText: 'Cancelar'
	    }).then((result) => {

	      if (result.value) {
	      	let main = this;
	      	this.game.players.filter(
	      		function(item, i){
	      			if(item.uid == main.userId)
				      	main.game.finishedBy = item.name;
	      		}
	      	);

	      	this.roundService.create(this.round);
  			this.gameService.updateGame(this.game, "revision").then(
	          (success) => {
	                        Swal.fire(
	                          'Listo!',
	                          'Felicidades!',
	                          'success'
	                        )
	          }
	        ).catch(
	          (error) => {
	                      console.log(  error);
	          }
	        );
	      }
	      else{
	      		return ;
	      }
	    })  	
  }

  approve(){
  	let main = this;
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

  	revisionStatus(round:Round, index:number){
  		console.log("REVISION STATUS");
  		let main = this;
  		let valueReturn = false;

  		round.roundPlayer[this.game.current].categories[index].revision.filter(
  			function(item, i){
  				console.log("------------------------------");
  				console.log(item);
  				if(item.uid == main.userId){
  					console.log("RETURNS THIS > " + item.approved);
  					valueReturn = item.approved;
  				}
				console.log("------------------------------");  				
  			}
  		);

  		return valueReturn;
  	}


  	revisionApprove(round:Round, index:number){
  		let main = this;

		round.roundPlayer[this.game.current].categories[index].revision.filter(
			  			function(item, i){

			  				if(item.uid == main.userId){
	  					  		let status = round.roundPlayer[main.game.current].categories[index].revision[i].approved;
								round.roundPlayer[main.game.current].categories[index].revision[i].approved = (status) ? false : true;			  					
			  				}
			  			}
			  		);

		//round.roundPlayer[this.game.current].categories[index].revision[player].approved = (status) ? false : true;

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

  	exit(){

	    Swal.fire({
	      title: 'Abandonar el juego',
	      text: "Desea continuar?",
	      icon: 'warning',
	      showCancelButton: true,
	      confirmButtonColor: '#3085d6',
	      cancelButtonColor: '#d33',
	      confirmButtonText: 'Abandonar',
	      cancelButtonText: 'Cancelar'
	    }).then((result) => {

	      if (result.value) {
			  	this.router.navigate(['/mygames']);
	      }
	    })


  	}

}
