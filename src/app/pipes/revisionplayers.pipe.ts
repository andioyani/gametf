import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/game.model';

@Pipe({
  name: 'revisionplayers'
})
export class RevisionplayersPipe implements PipeTransform {

  transform(value: Round[], userId:string, showUser:boolean): unknown {  	
    let rounds:Round[] = [];

    console.log(userId);
    console.log(showUser);

  	if(!value){
  		return null;	
  	}
  	else{
  		
  		value.forEach(
  			(round:Round) => {

  				if(
            (round.uidPlayer != userId && !showUser) 
            ||
            (round.uidPlayer == userId && showUser)
            ){
  					  rounds.push(round);
  				}
  				
  			}
  		)

  		console.log(rounds);
		  return rounds;
  	}


    
  }

}
