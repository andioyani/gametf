import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { GameModel,PlayerConnected, RoundPlayer, CategoryValue, Round } from '../../models/game.model';

import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoundService {

  constructor(private afs: AngularFirestore) { }

  get(roundId:string){
		return this.afs.collection('round').doc(roundId).valueChanges(); 
  }

  getCompare(uidGame:string){
  		return this.afs.collection<Round>('round', ref => ref.where("uidGame", "==", uidGame)).valueChanges();
  }



  create(round:Round){
  		return this.afs.collection('round').doc(round.uid).set(round);
  }



}
