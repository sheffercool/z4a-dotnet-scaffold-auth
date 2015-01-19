!function(){"use strict";function config($urlProvider,$locationProvider,$httpProvider){$urlProvider.otherwise("/"),$locationProvider.html5Mode({enabled:!1,requireBase:!1}),$locationProvider.hashPrefix("!"),$httpProvider.interceptors.push("AuthInterceptorService")}function run(authService){FastClick.attach(document.body),authService.fillAuthData()}angular.module("application",["ui.router","ngAnimate","LocalStorageModule","foundation","foundation.dynamicRouting","foundation.dynamicRouting.animations"]).config(config).run(run),config.$inject=["$urlRouterProvider","$locationProvider","$httpProvider"],run.$inject=["AuthService"]}();
angular.module("application").factory("AuthService",["$http","$q","localStorageService",function($http,$q,localStorageService){var serviceBase="http://localhost:50766/",authServiceFactory={},_authentication={isAuth:!1,userName:""},_saveRegistration=function(registration){return _logOut(),$http.post(serviceBase+"api/account/register",registration).then(function(response){return response})},_login=function(loginData){var data="grant_type=password&username="+loginData.userName+"&password="+loginData.password,deferred=$q.defer();return $http.post(serviceBase+"api/account/token",data,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(response){localStorageService.set("authorizationData",{token:response.access_token,userName:loginData.userName}),_authentication.isAuth=!0,_authentication.userName=loginData.userName,deferred.resolve(response)}).error(function(err){_logOut(),deferred.reject(err)}),deferred.promise},_logOut=function(){localStorageService.remove("authorizationData"),_authentication.isAuth=!1,_authentication.userName=""},_fillAuthData=function(){var authData=localStorageService.get("authorizationData");authData&&(_authentication.isAuth=!0,_authentication.userName=authData.userName)};return authServiceFactory.saveRegistration=_saveRegistration,authServiceFactory.login=_login,authServiceFactory.logOut=_logOut,authServiceFactory.fillAuthData=_fillAuthData,authServiceFactory.authentication=_authentication,authServiceFactory}]),angular.module("application").factory("AuthInterceptorService",["$q","$location","localStorageService",function($q,$location,localStorageService){var authInterceptorServiceFactory={},_request=function(config){config.headers=config.headers||{};var authData=localStorageService.get("authorizationData");return authData&&(config.headers.Authorization="Bearer "+authData.token),config},_responseError=function(rejection){return 401===rejection.status&&$location.path("/login"),$q.reject(rejection)};return authInterceptorServiceFactory.request=_request,authInterceptorServiceFactory.responseError=_responseError,authInterceptorServiceFactory}]);
angular.module("application").controller("IndexController",["$scope","$location","AuthService",function($scope,$location,authService){$scope.logOut=function(){authService.logOut(),$location.path("/home")},$scope.authentication=authService.authentication}]),angular.module("application").controller("NewsController",["$scope","$stateParams","$state","$http",function($scope,$stateParams,$state,$http){$scope.newsTime="Not retrieved yet.",$scope.getTime=function(){var responsePromise=$http.get("/api/info");responsePromise.success(function(data){$scope.newsTime=data}),responsePromise.error(function(data){$scope.newsTime="Failed to get time: "+data})}}]),angular.module("application").controller("SignupController",["$scope","$location","$timeout","AuthService",function($scope,$location,$timeout,authService){$scope.savedSuccessfully=!1,$scope.message="",$scope.registration={userName:"",password:"",confirmPassword:""},$scope.signUp=function(){authService.saveRegistration($scope.registration).then(function(){$scope.savedSuccessfully=!0,$scope.message="User has been registered successfully, you will be redicted to login page in 2 seconds.",startTimer()},function(response){var errors=[];for(var key in response.data.modelState)for(var i=0;i<response.data.modelState[key].length;i++)errors.push(response.data.modelState[key][i]);$scope.message="Failed to register user due to:"+errors.join(" ")})};var startTimer=function(){var timer=$timeout(function(){$timeout.cancel(timer),$location.path("/login")},2e3)}}]),angular.module("application").controller("LoginController",["$scope","$location","AuthService",function($scope,$location,authService){$scope.loginData={userName:"",password:""},$scope.message="",$scope.login=function(){authService.login($scope.loginData).then(function(){$location.path("/orders")},function(err){$scope.message=err.error_description})}}]);