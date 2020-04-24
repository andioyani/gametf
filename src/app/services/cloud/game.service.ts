import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { GameModel,PlayerConnected, Round, RoundPlayer, PlayerRevision, Player } from '../../models/game.model';
import { RoundService } from './round.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private afs: AngularFirestore, private roundService:RoundService) { }

  createGame(game:GameModel){
    console.log(game);
    this.afs.collection('round', ref => ref.where('uidGame', '==', game.uid)).get().subscribe(
        (doc) => {
                    doc.docs.forEach(
                        (round) => {
                          this.afs.collection('round').doc(round.id).delete();
                          //console.log(round.id);
                        }
                    );
                    // 
        }
    );
    
    let rounds:string[] = [];
    let letters = game.letters.toString();
    letters = letters.replace(/,/g, "");
    console.log(letters);
    console.log(letters.length);

    for(let i=0; i<game.rounds;i++){
      let randomLetter = Math.floor(Math.random() * letters.length);
      let letter = letters.charAt(randomLetter);
      letters = letters.replace(letter, "");
      
      rounds.push(letter);
    }

    game.letters = rounds;

  	return this.afs.collection<GameModel>('game').doc<GameModel>(game.uid).set(game).then(
  		(success) => {
  					game.players.forEach(
  						(player) => {

  									let roundId:string = game.uid + "_" + player.uid;
  									let round:Round = {uid:roundId, name:player.name, photo:player.photo, points:0, uidGame:game.uid, uidPlayer:player.uid, roundPlayer:[]};

  									for(let i=0; i < game.rounds; i++){
										let roundPlayer:RoundPlayer = {
																		number:i+1,
																		letter:game.letters[i],
																		categories:[],
																		finished:false,
																		finishedFirst:false
										}

	  									game.categories.forEach(
	  										(category) => {	  
	  											let listPlayerRevision:PlayerRevision[] = [];

	  											game.players.forEach(
	  												(pyr) => {
	  													if(pyr.uid != player.uid){
	  														listPlayerRevision.push({uid:pyr.uid, name:pyr.name, photo:pyr.photo, approved:true})
	  													}
	  												}
	  											);


	  											roundPlayer.categories.push({name:category, value:"", revision:listPlayerRevision, points:0});
	  										}
	  									);  								

	  									round.roundPlayer.push(roundPlayer);

	  									this.roundService.create(round);
  									}


  						}
  					);
  		}
  	).catch(
  		(error) => {console.log(error)}
  	);
    
  }

  getGameData(uid:string){
  	return this.afs.collection<GameModel>('game').doc<GameModel>(uid).valueChanges();
  }

  listUserGames(player:Player){
  	return this.afs.collection<GameModel>('game', ref =>  ref.where("players","array-contains", player)).valueChanges();		
  }

  updateGame(game:GameModel, status:string){
  	game.status = (status == 'online' || status == 'revision' || status == 'finished') ? status : game.status;

  	if(status == 'revision'){
  		game.revision.filter(
  			function(item, i){
  				game.revision[i].status = false;
  			}
		);

  	}

  	//console.log(game);
  	return this.afs.collection<GameModel>('game').doc<GameModel>(game.uid).update(game);
  }

  deleteGame(game:GameModel){
  	//Delete rounds associated

  	this.afs.collection<Round>('round', ref => ref.where("uidGame","==",game.uid)).valueChanges().subscribe(
  		(rounds:Round[]) => {
  							rounds.forEach(
  								(round:Round) => {
  									this.afs.collection<Round>('round').doc<Round>(round.uid).delete();
  								}		
  							);

  		}
  	);

  	return this.afs.collection<GameModel>('game').doc<GameModel>(game.uid).delete();
  }

}
