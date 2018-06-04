import { Mongo } from 'meteor/mongo';
 
export const Options = new Mongo.Collection('options');
export const VoteCounter = new Mongo.Collection('votecounter');
export const Texts = new Mongo.Collection('texts');
export const Theorems = new Mongo.Collection('theorems');


