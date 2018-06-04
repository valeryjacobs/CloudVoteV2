import { Template } from 'meteor/templating';
import { Session } from 'meteor/session'

import './body.html';

import { Options } from '../api/options.js';
import { Questions } from '../api/questions.js';
import { Answers } from '../api/answers.js';
import { Appstatus } from '../api/appstatus.js';

import { DataSource } from '../data/DataSource.js';

import { Clients } from '../api/clients.js';


var chart;
var container;
var dataSet;
var column;

Template.acTemplate.rendered = function () {

  container = this.find("#container");

  var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
  var question = Questions.findOne({ questionIndex: appstatus.questionIndex });
  var answers = Answers.find({ relatedQuestionId: question._id });


  var data = [];
  answers.forEach(function (item) {
    data.push({ x: item.answerText, value: item.score })
  });

  dataSet = anychart.data.set(data);

  chart = anychart.column();
  column = chart.column(dataSet);
  view = dataSet.mapAs();

  chart.animation(true);
  chart.container(container).draw();
};


Template.body.helpers({
  options() {
    return Options.find({}, { sort: { createdAt: -1 } });
  },
  questions() { return Questions.find({}, { sort: { questionIndex: -1 } }); },
  //answers() { return Answers.find(); }
  currentTemplate() {
    var status = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
    return status.currentTemplate;
  },
  adminTemplate() {
    if (getParameterByName('code') == '3q7b') {
      return 'controlPanel';
    }
    else { return {}; }
  }
});

Template.controlPanel.helpers({
  appStatus() {
    return Appstatus.findOne('NcHqQHHhJyY9LhW8X');
  }
})

Template.controlPanel.events({
  'click .setAdminMode'() {
    //Session.set('currentTemplate', 'adminPanel');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'adminPanel' } });
  },
  'click .setSurveyMode'() {
    //Session.set('currentTemplate', 'surveyPanel');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'surveyPanel' } });
  },
  'click .setDashboardMode'() {
    //Session.set('currentTemplate', 'dashboardPanel');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'dashboardPanel' } });
  },
  'click .startSurvey'() {
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'surveyPanel', votingEnabled: true, questionIndex: 0 } });
    Meteor.call('voting.start', { reset: true });

  },
  'click .stopVoting'() {
    // Appstatus.update('1', { votingEnabled: false });
    Session.set('statisId', 'NcHqQHHhJyY9LhW8X');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'surveyPanel', votingEnabled: false, questionIndex: 0 } });

  },
  'click .nextQuestion'() {
    var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'surveyPanel', votingEnabled: true, questionIndex: appstatus.questionIndex + 1 } });
  },
  'click .previousQuestion'() {
    var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
    Appstatus.update('NcHqQHHhJyY9LhW8X', { $set: { currentTemplate: 'surveyPanel', votingEnabled: true, questionIndex: appstatus.questionIndex - 1 } });
  }
});

Template.question.helpers({
  answers() { return Answers.find({ relatedQuestionId: this._id }); }
});

Template.surveyAnswer.helpers({
  checked() {
    return Session.get('selectedAnswer') == this._id;
  }
});

Template.survey.events({
  'click .submitVote'() {
    if (!Session.set('answered')) {
      Session.set(this._id, true);
      Meteor.call('answer.submit', { answerId: Session.get('selectedAnswer'), clientId: localStorage.getItem("clientId") });

      Session.set('answered', true);
    }
  }
});

Template.survey.helpers({
  isDeactivated: function () {
    var answered = Session.get('answered');
    if (answered == undefined) {
      return false;
    }
    else {
      return answered;
    }

  }
});


Template.surveyAnswer.events({
  'click .answer'() {
    if (!Session.get('answered')) {
      Session.set('selectedAnswer', this._id)
    }
  }
});

Template.survey.helpers({

  questionText() {
    var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
    var question = Questions.findOne({ questionIndex: appstatus.questionIndex });
    return question.questionText
  },
  surveyAnswers() {
    var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
    var question = Questions.findOne({ questionIndex: appstatus.questionIndex });
    return Answers.find({ relatedQuestionId: question._id });
  },
});

Template.adminPanel.helpers({
  questions() { return Questions.find({}, { sort: { questionIndex: -1 } }); },
})

Template.question.events({
  'click .delete'() {
    Appstatus.insert({ editMode: true, surveyMode: false });
    Questions.remove(this._id);
  },
  'click .edit'() {
  }
});

Template.questionEdit.events(
  {
    'click .addQuestion'(event, template) {

      var questionText = template.find('#questiontext').value;
      var questionIndex = parseInt(template.find('#questionindex').value);

      Session.set("currentQuestionId", Questions.insert({
        questionIndex,
        questionText
      }));
    },

    'click .addAnswer'(event, template) {
      var answerText = template.find('#answertext').value;
      var relatedQuestionId = Session.get('currentQuestionId');

      Answers.insert({
        answerText,
        relatedQuestionId
      });
    }
  }
);

Tracker.autorun(() => {
  var answers = Answers.find({}).fetch();
  updateChart();
});

Tracker.autorun(() => {
  var answers = Answers.find({}).fetch();

});

function updateChart() {

  var appstatus = Appstatus.findOne('NcHqQHHhJyY9LhW8X');
  if (appstatus) {
    var question = Questions.findOne({ questionIndex: appstatus.questionIndex });
    var answers = Answers.find({ relatedQuestionId: question._id });

    if (chart) {

      var data = [];
      answers.forEach(function (item) {
        data.push({ x: item.answerText, value: item.score })
      });

      view = dataSet.mapAs();

      data.forEach(function (item) {
        view.set(
          data.indexOf(item),                       // get index of clicked column
          "value",                            // get parameter to update
          item.value
        );
      })

      chart.container(container).draw();
    }
  }
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
