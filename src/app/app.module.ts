import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { AdsenseModule } from 'ng2-adsense';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RegistroComponent } from './pages/registro/registro.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { HeaderComponent } from './pages/header/header.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { RoundComponent } from './pages/round/round.component';
import { SortplayersPipe } from './pipes/sortplayers.pipe';
import { GameComponent } from './pages/game/game.component';
import { MygamesComponent } from './pages/mygames/mygames.component';
import { RevisionplayersPipe } from './pipes/revisionplayers.pipe';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { WikiComponent } from './pages/wiki/wiki.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    ProfileComponent,
    FriendsComponent,
    RoundComponent,
    SortplayersPipe,
    GameComponent,
    MygamesComponent,
    RevisionplayersPipe,
    InvitationComponent,
    WikiComponent   
  ],
  imports: [

    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
