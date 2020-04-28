import { User } from './user.model';

export interface GameModel{
	uid:string;
	title:string;
	current:number;
	letters:string[];	
	rounds:number;
	categories:string[];
	players:Player[];
	owner:string;
	stop:boolean;
	connected:PlayerConnected[];
	revision:PlayerConnected[];
	status:string;
	winner:PlayerWinner[];
	finishedBy:string;
}

export interface PlayerWinner{
	name:string;
	photo:string;
	points:number;
}

export interface PlayerConnected{
	uid:string;
	name:string;
	status:boolean;
	photo: string;
}

export interface Player{
	uid:string;
	name:string;
	photo:string;
}

export interface Round{
	uid:string;
	uidGame:string;
	uidPlayer:string;
	name:string;
	photo:string;	
	points:number;
	roundPlayer:RoundPlayer[];
}

export interface RoundPlayer{
	number:number;
	letter:string;
	categories:CategoryValue[];
	finished:boolean;
	finishedFirst:boolean;
}

export interface PlayerRevision{
	uid:string;
	name:string;
	photo:string;
	approved:boolean;
}

export interface CategoryValue{
	name:string;
	value:string;
	points:number;
	revision:PlayerRevision[]
}