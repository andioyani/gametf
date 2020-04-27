import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/game.model';

@Pipe({
  name: 'revisionplayers'
})
export class RevisionplayersPipe implements PipeTransform {

  transform(value: Round[], args: unknown[]): unknown {  	
  	let rounds:Round[] = [];

  	if(!value){
  		return null;	
  	}
  	else{
  		
  		value.forEach(
  			(round:Round) => {

  				if(round.uidPlayer != args.toString()){
  					rounds.push(round);
  				}
  				
  			}
  		)

  		console.log(rounds);
		return rounds;
  	}


    
  }

}
