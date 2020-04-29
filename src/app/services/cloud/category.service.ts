import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { Category } from '../../models/game.model';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {

  constructor(private afs: AngularFirestore) { }

  list(){
  	return this.afs.collection<Category>('categories').valueChanges();
  }

  add(category:Category){
	return this.afs.collection<Category>('categories').doc(category.name.trim().replace(/ /g, "").toLowerCase()).set(category);
  }
}
