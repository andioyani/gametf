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
  selector: 'app-game',
  templateUrl: './game.component.html'
})

export class GameComponent implements OnInit, OnDestroy {

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
				                            userDoc.friends.forEach(
				                                (friend:User) => {this.listFriends.push(friend);}
				                            );
				                            this.playerUser = {uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo};                                
				                            console.log(this.playerUser);
			                            	let id:string = Md5.hashStr(this.playerUser.uid + new Date().toTimeString()).toString();
										    this.game = {uid:id, title:"", winner:null, current:0, rounds:this.letters.length, owner:this.playerUser.uid, players:[], categories:[], connected:[], revision:[], stop:false, letters:[], status:"online"};    
									    	this.game.players.push(this.playerUser);  

				          }
				        );
				        
				      }
				    });

	}

	loggedData = null;
	userData = null;
	gamesData = null;


	playerUser:Player = null;
	letters:string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
	lettersRemoved:string[] = [];
	listFriends:User[] = [];
	listFriendAdded:string[] = [];
	category:string = null;
	routeSubscribe=null;
	gameData = null;

	game:GameModel=null;
	selectedLetters:string[]=null;
	removedLetters:string[]=null;

	ngOnInit(): void {
      this.routeSubscribe = this.route.params.subscribe(params => {
           let idGame = params['id'];
           
           if(idGame){
              this.gameData = this.gameService.getGameData(idGame).subscribe(
                  (game:GameModel) => { 
                                        this.game = game;
                                        this.game.current = 0;
                                        this.game.connected = [];
                                        this.game.revision = [];
                                        this.game.status = 'online';
                                        this.game.winner = null;

                                        this.game.players.forEach(
                                            (friend) => {
                                                          this.listFriendAdded.push(friend.uid);
                                            }
                                        );  

                                      }
              );
           }
       });

	}

	ngOnDestroy(){
	    if(this.userData)
	      this.userData.unsubscribe();
	    if(this.loggedData)
	      this.loggedData.unsubscribe();
	    if(this.gamesData)
	      this.gamesData.unsubscribe();
	    if(this.routeSubscribe)
	      this.routeSubscribe.unsubscribe();
	    if(this.gameData)
	      this.gameData.unsubscribe();
	}

	onSubmit(form:NgForm){
	    if(form.invalid){ 
		    Swal.fire({
		       allowOutsideClick: true,
		       icon: 'error',
		       text: 'Verificá los datos ingresados'
		    });

	    	return; 
	    }
	    
	    this.game.letters = this.letters;   

	    let main = this;

	    this.game.players.forEach(
	        (player:Player) => {
	                            let playerConnected:PlayerConnected = {uid:player.uid, name:player.name, status:false};
	                            main.game.connected.push(playerConnected);
	                            main.game.revision.push(playerConnected);
	        }
	    );

	    Swal.fire({
	       allowOutsideClick: false,
	       icon: 'info',
	       text: 'Creando juego y enviando invitaciones, espere por favor'
	    });

	    Swal.showLoading();

	    this.gameService.createGame(this.game).then(
	      (success) => {
	                Swal.close(); 
	                this.game = null;
	                this.router.navigate([`/`]);
	      }
	    ).catch(
	       (err) => {
	         console.log(err);
	         Swal.fire({
	           icon: 'error',
	           text: 'No pudo grabarse el juego, vuelva a intentarlo'
	         });

	       }
	    )

	    console.log(this.game);

	}

	restartLetters(){
	  this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
	}

	addRemoveLetter(letter:string){
		console.log(letter);
		let main = this;
		let add = true;

		this.letters.filter(
			function(item, i){
				if(item==letter){
					main.letters.splice(i, 1);
					add = false;

					if(main.game.rounds > main.letters.length){
						main.game.rounds = main.letters.length;
					}
				}
			}
		);

		if(add)
			this.letters.push(letter);

	}

	addCategory(){
	this.game.categories.push(this.category);
	this.category = null;
	}

	remCategory(category:string){
	let main = this;

	this.game.categories.filter(
	    function(item,i){
	      if(item == category){
	        main.game.categories.splice(i, 1);
	      }
	    }
	);
	}

	addPlayer(friend:User){
	this.game.players.push({uid:friend.uid, name:friend.name, photo:friend.photo});
	this.listFriendAdded.push(friend.uid);

	console.log(this.game.players);
	}

	remPlayer(friend:User){
	let main = this;

	this.game.players.filter(
	    function(item,i){
	      if(item.uid == friend.uid){
	        main.game.players.splice(i, 1);
	      }
	    }
	);

	this.listFriendAdded.filter(
	    function(item,i){
	      if(item == friend.uid){
	        main.listFriendAdded.splice(i, 1);
	      }
	    }
	);

	}

}
