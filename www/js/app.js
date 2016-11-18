angular.module('scannerApp', ['ionic', 'scanner.controllers', 'scanner.services', 'ngCordova', 'ngStorage'])

.run(function($ionicPlatform) {

  $ionicPlatform.ready(function(){

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if( window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard ){

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if( window.StatusBar ){

      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider, $localStorageProvider) {

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  // main page of the app
  .state('app.skus', {
    url: "/skus",
    views: {
      'content' :{
        templateUrl: "templates/skus.html",
        controller:'SkuCtrl'
      }
    }
  })
  // found in the menu
  .state('app.settings', {
    url: "/settings",
    views: {
      'content' :{
        templateUrl: "templates/settings.html"
      }
    }
  });

  $urlRouterProvider.otherwise('/app/skus');

});
