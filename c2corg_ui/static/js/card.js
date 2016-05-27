goog.provide('app.CardController');
goog.provide('app.cardDirective');

goog.require('app');
goog.require('app.utils');


/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cardDirective = function($compile, $templateCache) {
  var template = function(doctype) {
    return $templateCache.get('/static/partials/card_' + doctype + '.html');
  };

  return {
    restrict: 'E',
    controller: 'AppCardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '=appCardDoc'
    },
    link: function(scope, element, attrs) {
      var doc = scope['cardCtrl']['doc'];
      var type = app.utils.getDoctype(doc['type']);
      element.html(template(type));
      $compile(element.contents())(scope);
    }
  };
};


app.module.directive('appCard', app.cardDirective);


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @export
 * @ngInject
 */
app.CardController = function(gettextCatalog) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {string}
   * @export
   */
  this.lang = gettextCatalog.currentLanguage;

  /**
   * @type {Object}
   * @private
   */
  this.doc_ = this['doc'];

  /**
   * @type {Object}
   * @export
   */
  this.locale = this['doc']['locales'][0];
  for (var i = 0, n = this['doc']['locales'].length; i < n; i++) {
    var l = this['doc']['locales'][i];
    if (l['lang'] === this.lang) {
      this.locale = l;
      break;
    }
  }
};


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
app.CardController.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * @export
 */
app.CardController.prototype.openCardPage = function() {
  window.location.href = app.utils.buildDocumentUrl(
    app.utils.getDoctype(this.doc_['type']),
    this.doc_['document_id'],
    this.doc_['locales'][0]['lang']);
};


app.module.controller('AppCardController', app.CardController);