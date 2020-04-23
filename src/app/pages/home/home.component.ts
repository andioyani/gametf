import { Component, OnInit, OnDestroy} from '@angular/core';
import { GameModel, PlayerConnected, Player } from '../../models/game.model';
import  Swal  from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/cloud/user.service';
import { GameService } from '../../services/cloud/game.service';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms'; 
import { Router } from '@angular/router';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit, OnDestroy {

  constructor(private auth:AuthService,private router:Router, private userService:UserService, private gameService:GameService) { 
    this.loggedData = this.auth.isLoggedIn().subscribe(
        (logged) => {
          if(logged){  
            this.userId = logged.uid;
            this.userName = logged.displayName;
            this.userPhoto = logged.photoURL;

            this.userData = this.userService.getUserData(logged.uid).valueChanges().subscribe(
              (userDoc:User) => {
                                userDoc.friends.forEach(
                                    (friend:User) => {this.listFriends.push(friend);}
                                );
                                this.playerUser = {uid:userDoc.uid, name:userDoc.name, photo:userDoc.photo};                                

                                this.gamesData = this.gameService.listUserGames(this.playerUser).subscribe(
                                    ( list:GameModel[] ) => {
                                                              console.log(logged);
                                                              this.listGames = list;
                                                               
                                    }
                                );                          
              }
            );
            
          }
        });
  }

  loggedData = null;
  userData = null;
  gamesData = null;

  playerUser:Player = null;
  letters:string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  lettersRemoved:string[] = [];
  userId:string = null;
  private userName:string = null;
  private userPhoto:string = null;
  listFriends:User[] = [];
  listFriendAdded:string[] = [];
  category:string = null;
  listGames:GameModel[];

  game:GameModel=null;
  selectedLetters:string[]=null;
  removedLetters:string[]=null;

  ngOnInit(){

  }

  ngOnDestroy(){
    //this.listFriends.unsubscribe();
    this.userData.unsubscribe();
    this.loggedData.unsubscribe();
    this.gamesData.unsubscribe();
  }

  create(){
    let id:string = Md5.hashStr(this.userId + new Date().toTimeString()).toString();
    this.game = {uid:id, current:0, rounds:this.letters.length, owner:this.userId, players:[], categories:[], connected:[], revision:[], stop:false, letters:[], status:"online"};    
  }

  removeElement(){
    console.log(this.selectedLetters);
    if(!this.selectedLetters || this.selectedLetters.length < 1){
       Swal.fire({
         allowOutsideClick: true,
         icon: 'error',
         text: 'Debe seleccionar una letra'
       });
      
      return ;
    }

    if((this.letters.length - this.selectedLetters.length) < 6){
       Swal.fire({
         allowOutsideClick: true,
         icon: 'error',
         text: 'Ha seleccionado demasiadas letras'
       });
      
      return ;
    }

    for(let letter of this.selectedLetters){
      let main = this;
      this.letters.find(function(item, i){
        if(item == letter){
          main.letters.splice(i, 1);
          main.lettersRemoved.push(letter);
        }
      });

      this.letters.sort();
      this.lettersRemoved.sort();
      this.game.rounds = this.letters.length;
    }
  }

  addElement(){
    if(!this.removedLetters || this.removedLetters.length < 1){
       Swal.fire({
         allowOutsideClick: true,
         icon: 'error',
         text: 'Debe seleccionar una letra'
       });
      
      return ;
    }

     for(let letter of this.removedLetters){
      let main = this;

      this.lettersRemoved.find(function(item, i){
        if(item == letter){
          main.lettersRemoved.splice(i, 1);
          main.letters.push(letter);
        }
      });

      this.letters.sort();
      this.lettersRemoved.sort();
      this.game.rounds = this.letters.length;
    }  
  }

  addRound(){  
    this.game.rounds++;
  }

  remRound(){
    this.game.rounds--;
  }

  addPlayer(friend:User){
    this.game.players.push({uid:friend.uid, name:friend.name, photo:friend.photo});
    this.listFriendAdded.push(friend.uid);
    
    console.log(this.game.players);
  }

  remPlayer(friend:User){
    let main = this;

    this.game.players.filter(
        function(item,i){
          if(item.uid == friend.uid){
            main.game.players.splice(i, 1);
          }
        }
    );

    this.listFriendAdded.filter(
        function(item,i){
          if(item == friend.uid){
            main.listFriendAdded.splice(i, 1);
          }
        }
    );

  }

  addCategory(){
    this.game.categories.push(this.category);
    this.category = null;
  }

  remCategory(category:string){
    let main = this;

    this.game.categories.filter(
        function(item,i){
          if(item == category){
            main.game.categories.splice(i, 1);
          }
        }
    );
  }

  onSubmit(form:NgForm){
    console.log(form);

    if(form.invalid){ return; }
    
    this.game.letters = this.letters;   
    this.game.players.push({uid:this.userId, name:this.userName, photo:this.userPhoto});

    let main = this;

    this.game.players.forEach(
        (player:Player) => {
                            let playerConnected:PlayerConnected = {uid:player.uid, status:false};
                            main.game.connected.push(playerConnected);
                            main.game.revision.push(playerConnected);
        }
    );

    Swal.fire({
       allowOutsideClick: false,
       icon: 'info',
       text: 'Creando juego y enviando invitaciones, espere por favor'
    });

    Swal.showLoading();

    this.gameService.createGame(this.game).then(
      (success) => {
                Swal.close(); 
                this.router.navigate([`/round/${this.game.uid}`]);
      }
    ).catch(
       (err) => {
         console.log(err);
         Swal.fire({
           icon: 'error',
           text: 'No pudo grabarse el juego, vuelva a intentarlo'
         });

       }
    )

    console.log(this.game);
  }

  cancelar(){
      this.game = null; 
  }

  deleteGame(game:GameModel){
    Swal.fire({
      title: 'Eliminar juego?',
      text: "Se borrarán todos los datos, desea continuar?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.value) {
        this.gameService.deleteGame(game).then(
          (success) => {
                        Swal.fire(
                          'Listo!',
                          'El juego fue eliminado.',
                          'success'
                        )
          }
        ).catch(
          (error) => {
                      console.log(  error);
          }
        );
      }
    })



  }

}