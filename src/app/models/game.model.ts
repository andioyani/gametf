import { User } from './user.model';

export interface GameModel{
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
}

export interface PlayerConnected{
	uid:string;
	status:boolean;
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
	roundPlayer:RoundPlayer[];
}

export interface RoundPlayer{
	number:number;
	letter:string;
	categories:CategoryValue[];
	finished:boolean;
	finishedFirst:boolean;
}

export interface CategoryValue{
	name:string;
	value:string;
}