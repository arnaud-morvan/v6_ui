goog.provide('app.GpxUploadController');
goog.provide('app.gpxUploadDirective');

goog.require('app');
/** @suppress {extraRequire} */
goog.require('ngeo.filereaderDirective');
goog.require('ol.format.GPX');


/**
 * This directive is used to display a GPX file upload button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.gpxUploadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppGpxUploadController',
    controllerAs: 'gpxCtrl',
    bindToController: true,
    template:
      '<div class="upload-file">' +
        '<button class="orange-btn btn" type="button" ' +
          'translate>upload a GPS track <span ' +
          'class="glyphicon glyphicon-upload"></span></button>' +
        '<input type="file" ngeo-filereader="gpxCtrl.fileContent" ' +
          'ngeo-filereader-supported="gpxCtrl.fileReaderSupported" />' +
      '</div>'
  };
};


app.module.directive('appGpxUpload', app.gpxUploadDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @export
 * @ngInject
 */
app.GpxUploadController = function($scope) {

  this.scope_ = $scope;

  /**
   * @type {boolean|undefined}
   * @export
   */
  this.fileReaderSupported = undefined;

  /**
   * @type {string}
   * @export
   */
  this.fileContent = '';

  $scope.$watch(function() {
    return this.fileContent;
  }.bind(this), this.importGpx_.bind(this));
};


/**
 * @param {string} gpx GPX document.
 * @private
 */
app.GpxUploadController.prototype.importGpx_ = function(gpx) {
  var gpxFormat = new ol.format.GPX();
  var features = gpxFormat.readFeatures(gpx, {
    featureProjection: 'EPSG:3857'
  });
  if (features.length > 0) {
    this.scope_.$root.$emit('featuresUpload', features);
  }
};


app.module.controller('AppGpxUploadController', app.GpxUploadController);
