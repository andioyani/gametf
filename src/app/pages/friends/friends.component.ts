import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/cloud/user.service';
import { GameService } from '../../services/cloud/game.service';
import { User } from '../../models/user.model';
import { GameModel, Player } from '../../models/game.model';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html'
})
export class FriendsComponent implements OnInit, OnDestroy {

  constructor(private auth:AuthService, private router:Router, private userService:UserService, private gameService:GameService) { }

  listUserCollection;
  userData;
  loggedData;

  listUsers:Player[] = [];
  userId:string = null;
  user:User = null;

  ngOnInit() {

		this.loggedData = this.auth.isLoggedIn().subscribe(
	      (logged) => {
	        if(logged){
	        	this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
	        		(userDoc:User) => {
                                  this.user = userDoc;
                                  this.listUserCollection = this.gameService.listUserGames({uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo}).subscribe(
                                    (games:GameModel[]) => {
                                                            this.listUsers = [];
                                                            let uids:string[] = [];

                                                            games.forEach(
                                                                (game:GameModel) => {
                                                                                    game.players.forEach(
                                                                                        (player:Player) => {
                                                                                              if(player.uid != this.user.uid && !uids.includes(player.uid)){
                                                                                                  uids.push(player.uid);
                                                                                                  let userAdd:Player = {name:player.name, uid:player.uid, photo:player.photo};
                                                                                                  
                                                                                                  this.listUsers.push(userAdd);
                                                                                              }
                                                                                        }
                                                                                    ); 
                                                                }
                                                            );
                                                            console.log(games);
                                    }    
                                  );
                                }
	        	);

          this.userId = logged.uid;

        	


            /*              
    				this.listUserCollection = this.userService.listUsers().valueChanges().pipe(map(
    						(map) => {
    									this.listUsers = [];
                      let uids:string[] = [];

    									map.forEach( (user:User) => {
    										if(user.uid != logged.uid){
                          let userAdd:User = {name:user.name, uid:user.uid, email:user.email, photo:user.photo};
    											this.listUsers.push(userAdd);
    										}
    									} )
    						}
    					)).subscribe();        	*/
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
