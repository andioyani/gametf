import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Observable, } from 'rxjs';
import { Router } from '@angular/router';
import { map }  from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(public afAuth: AngularFireAuth, private afs:AngularFirestore, private router:Router) {}
  
  isLoggedIn(){  	
  	return this.afAuth.authState;
  }

  loginEmail(login:any) {
    return this.afAuth.auth.signInWithEmailAndPassword(login.email, login.password);    
  }

  registerEmail(login:any){
  	return this.afAuth.auth.createUserWithEmailAndPassword(login.email, login.password);
  }

  async loginProvider(providerName:string){
  	
  	if(providerName == 'GOOGLE'){
  		return await this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  	}
  	else if(providerName == 'FACEBOOK'){
  		return await this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  	}
  	else{
  		return ;
  	}

  }

  logOut(){
    this.afAuth.auth.signOut();
  }

}