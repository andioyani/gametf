import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/game.model';

@Pipe({
  name: 'sortplayers'
})
export class SortplayersPipe implements PipeTransform {

  transform(value: Round[], ...args: unknown[]): unknown {

  	if(!value){
  		return null;
  	}
  	else{
	  	let data = [];	  		  
	  	let points:number[] = [];	  		  

	  	value.forEach(
	  		(round) => {
	  			points.push(round.points);
	  		}
	  	);

		points.sort(function(a, b){return b-a});


	  	for( let i=0; i<points.length; i++ ){	  		
	  		console.log(points[i]);

		  	value.forEach(
		  		(round) => {
	  				if(round.points == points[i]){
	  					data.push({name:round.name, photo:round.photo, points:round.points, position:i+1});
	  				}
		  		}
		  	);

	  	}
		
	    return data;  		
  	}
  }

}
