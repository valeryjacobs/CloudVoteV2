import '../imports/ui/body.js';

import { Random } from 'meteor/random'
import { Appstatus } from '/imports/api/appstatus.js';
import { Clients } from '/imports/api/clients.js';

var clientId;

Meteor.startup(() => {
  if (localStorage.getItem("clientId") == "undefined") {
    clientId = Random.id();
    localStorage.setItem("clientId", clientId);
  }
  else {
    Session.set('clientId', localStorage.getItem("clientId"));
    var clientId = localStorage.getItem("clientId");
    var client = Clients.findOne({ clientId: clientId }).fetch();
    if (client) {
      Clients.update(client.id, { $set: { active: true } })
    }
    else {
      Clients.insert({ clientId: localStorage.getItem("clientId") });
    }
  }
});

