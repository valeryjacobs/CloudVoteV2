import { Template } from 'meteor/templating';

import { Options } from '../api/options.js';
 
import './option.html';
 
// Template.option.events({
//   'click .toggle-checked'() {
//     // Set the checked property to the opposite of its current value
//     Options.update(this._id, {
//       $set: { checked: ! this.checked },
//     });
//   }
// });