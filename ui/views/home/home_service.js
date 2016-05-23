angular.module('ItauApp')
.service('HistorySvc', ['$http', 'Config', function ($http, Config) {
  'use strict';



  this.getAverageSLAChartData = function(sStartDate, sEndDate, iUserId, sMediaFilter, fnCallback){
    //console.log(sStartDate,sEndDate,iUserId,sMediaFilter,fnCallback);
    var sQueryString = '?start_date=' + sStartDate + '&end_date=' + sEndDate + '&user=' + iUserId + '&media=' +sMediaFilter;

    $http.get(Config.endpoints.historySLA + sQueryString).success(function(data){
      fnCallback(data);
    }).error(function(err){
      new Error('Error reading AVG SLA Data');
    });
  };

  this.getAgendaCompletionChartData = function(sStartDate, sEndDate, iUserId, sMediaFilter, fnCallback){
    var sQueryString = '?startDate=' + sStartDate + '&endDate=' + sEndDate + '&userId=' + iUserId + '&mediaType=' +sMediaFilter;

    $http.get(Config.endpoints.agenda_completion + sQueryString).success(function(data){
      fnCallback(data);
    }).error(function(err){
      new Error('Error reading Agenda Completion Data');
    });
  };

  this.getUsers = function(callback) {
    $http.get(Config.endpoints.historyUsers).success(function(data) {
      callback(data);
    }).error(function(err) {
      new Error('Error reading Users data');
    });
  };

}]);
