import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { GameModel,PlayerConnected, Round, RoundPlayer } from '../../models/game.model';
import { RoundService } from './round.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private afs: AngularFirestore, private roundService:RoundService) { }

  createGame(game:GameModel){
  	//If repeated should delete old information
  	return this.afs.collection<GameModel>('game').doc<GameModel>(game.owner).set(game).then(
  		(success) => {
  					//create rounds
  					game.players.forEach(
  						(player) => {
  									let roundId:string = game.owner + "_" + player.uid;
  									let round:Round = {uid:roundId, name:player.name, uidGame:game.owner, uidPlayer:player.uid, roundPlayer:[]};

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
	  											roundPlayer.categories.push({name:category, value:""});
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
  	return this.afs.collection<GameModel>('game').doc<GameModel>(game.owner).update(game);
  }

}
