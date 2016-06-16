goog.provide('app.OutingEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Alerts');
goog.require('app.Document');
goog.require('app.utils');


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} appDocument
 * @constructor
 * @extends {app.DocumentEditingController}
 * @ngInject
 * @export
 */
app.OutingEditingController = function($scope, $element, $attrs,
    appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument) {

  goog.base(this, $scope, $element, $attrs, appAuthentication,
    ngeoLocation, appAlerts, appApi, authUrl, appDocument);

  // allow association only for a new outing to existing route
  if (ngeoLocation.hasParam('r')) {
    var urlParam = {'routes': ngeoLocation.getParam('r')};
    appApi.getDocumentByIdAndDoctype(urlParam['routes'], 'r').then(function(doc) {
      this.documentService.pushToAssociations(doc.data['routes'].documents[0], 'routes', true);
    }.bind(this));
  }

  if (this.auth.isAuthenticated()) {
    this.formatOuting_(this.scope[this.modelName]);
  }
};
goog.inherits(app.OutingEditingController, app.DocumentEditingController);


/**
 * @param {Object} response Response from the API server.
 * @override
 * @public
 */
app.OutingEditingController.prototype.successRead = function(response) {
  goog.base(this, 'successRead', response);

  var outing = this.scope[this.modelName];
  // check if user has right to edit -> the user is one of the associated users
  if (this.auth.hasEditRights(outing['associations']['users'])) {
    outing = this.formatOuting_(outing);
    this.differentDates = app.utils.areDifferentDates(outing['date_start'], outing['date_end']);
  } else {
    this.alerts.addError('you have no rights to edit this document');
    setTimeout(function() { // redirect to the details-view page
      window.location = window.location.href.replace('/edit', '');
    }, 3000);
  }
};


/**
 * @param {appx.Document} data Document attributes.
 * @return {appx.Document}
 * @override
 * @public
 */
app.OutingEditingController.prototype.prepareDataForCreation = function(data) {
  // adapt the Object for what's expected at the API side + format the outing
  this.formatOuting_(/** @type appx.Outing */ (data));

  for (var i = 0; i < data['associations']['users'].length; i++) {
    data['associations']['users'][i]['id'] = data['associations']['users'][i]['document_id'];
    delete data['associations']['users'][i]['document_id'];
  }
  data['associations']['users'].push({'id' : this.auth.userData.id});
  return data;
};


/**
 * @param {appx.Outing} outing
 * @private
 */
app.OutingEditingController.prototype.formatOuting_ = function(outing) {
  if (this.submit) {
    // transform condition_levels to a string
    outing['locales'][0]['conditions_levels'] = JSON.stringify(outing['locales'][0]['conditions_levels']);

    // if no date end -> make it the same as date start
    if (!outing['date_end'] && outing['date_start'] instanceof Date) {
      outing['date_end'] = outing['date_start'];
    }
  }
  // creating a new outing -> init locales and associations
  if (!outing['locales']) {
    outing['locales'] = [{}];
  }
  if (!outing['associations']) {
    outing['associations'] = {'routes': [], 'waypoints': [], users: []};
  }
  // convert existing date from string to a date object
  if (outing['date_end'] && typeof outing['date_end'] === 'string') {
    outing['date_end'] = app.utils.formatDate(outing['date_end']);
  }
  if (outing['date_start'] && typeof outing['date_start'] === 'string') {
    outing['date_start'] = app.utils.formatDate(outing['date_start']);
  }

  var conditions = outing['locales'][0]['conditions_levels'];
  // conditions_levels -> to Object, snow_height -> to INT
  if (conditions && typeof conditions === 'string') {
    conditions = JSON.parse(conditions);
    for (var i = 0; i < conditions.length; i++) {
      conditions[i]['level_snow_height_soft'] = parseInt(conditions[i]['level_snow_height_soft'], 10);
      conditions[i]['level_snow_height_total'] = parseInt(conditions[i]['level_snow_height_total'], 10);
    }
  } else {
    if (!this.submit) {
      // init empty conditions_levels for ng-repeat
      outing['locales'][0]['conditions_levels'] = [{
        'level_snow_height_soft': '',
        'level_snow_height_total': '',
        'level_comment': '',
        'level_place': ''
      }];
    }
  }
  this.submit = false;
  return outing;
};


app.module.controller('appOutingEditingController', app.OutingEditingController);
