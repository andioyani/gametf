export class UserModel{
	email:string;
	password:string;
	name:string;
}

export interface User{
	uid:string;
	email:string;
	name:string;
	photo:string;
	friends?:User[];
}