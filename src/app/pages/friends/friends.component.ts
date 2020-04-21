import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/cloud/user.service';
import { User } from '../../models/user.model';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html'
})
export class FriendsComponent implements OnInit, OnDestroy {

  constructor(private auth:AuthService, private router:Router, private userService:UserService) { }

  listUserCollection;
  userData;
  loggedData;

  listUsers:User[] = [];
  userId:string = null;
  user:User = null;

  ngOnInit() {

		this.loggedData = this.auth.isLoggedIn().subscribe(
	      (logged) => {
	        if(logged){
	        	this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
	        		(userDoc:User) => {this.user = userDoc}
	        	);

	        	this.userId = logged.uid;
	        	
				this.listUserCollection = this.userService.listUsers().valueChanges().pipe(map(
						(map) => {
									this.listUsers = [];

									map.forEach( (user:User) => {
										if(user.uid != logged.uid){
                      let userAdd:User = {name:user.name, uid:user.uid, email:user.email, photo:user.photo};
											this.listUsers.push(userAdd);
										}
									} )
						}
					)).subscribe();        	
		    }
		}); 

  }

  /*
  addFriend(uid:string){
  	if(!this.user.friends)
  		this.user.friends = [];

  	this.user.friends.push(uid);

  	this.userService.update(this.user);
  }
  */

  checkFriend(friend:User){
    let response = true;

    this.user.friends.filter(
      function(item, i){
        
        if(item.uid == friend.uid){
            response = false;
        }

    });
    
    return response;
  }

  addFriend(friend:User){
    this.user.friends.push(friend);    
    this.userService.update(this.user);
  }

  removeFriend(friend:User){  	
    let thisMain = this;

  	this.user.friends.filter(
  		function(item, i){
  			if(item.uid == friend.uid){
  				console.log(item);
  				thisMain.user.friends.splice(i, 1);
  			}
  		}
  	);  
  	
    this.userService.update(this.user);
  }

  ngOnDestroy(){
  	this.listUserCollection.unsubscribe();
    this.userData.unsubscribe();
    this.loggedData.unsubscribe();
  }


}
