import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private afs: AngularFirestore) { }

  getUserData(uid:string){
    return this.afs.doc<User>(`users/${uid}`);
  }

  createUser(user:User){
  	const userDoc = this.afs.collection('users').doc(user.uid).get();

	userDoc.subscribe(
		(userValue) => {
							if(!userValue.exists){
                user.friends = [];
								this.afs.collection('users').doc(user.uid).set(user);									
							}
						}							
	  );
  }

  listUsers(){
  	return this.afs.collection('users');
  }

  update(user:User){
    return this.afs.collection('users').doc(user.uid).update(user);
  }


}
