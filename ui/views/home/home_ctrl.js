angular.module('ItauApp').controller('HistoryCtrl',[
  '$scope', '$location', '$rootScope', 'HistorySvc', 'Config', function($scope, $location, $rootScope, HistorySvc,Config) {
  'use strict';

  var today = Config.inputDate;
  //mock data for development
  function _generateDummyData(){
    var aDates = $scope.timeRangeSelection.selectedValue.value();

    var dStartingDate = aDates[0];
    var dEndDate = aDates[1];
    var aData = [];
    while(dStartingDate.getTime() <= dEndDate.getTime()){
      dStartingDate = new Date(dStartingDate.getTime() + (Math.floor(Math.random() * 12) + 3) * 60 * 60 * 1000);
      aData.push({
        value : Math.floor(Math.random() * 60) + 30,
        date: dStartingDate
      });
    }
    //console.log(aData);
    return aData;
  }


//Media filter
  $scope.selectedMediaFilter = 'VOICE';
  $scope.handleMediaFilterPressed = function(sMediaName){
    $scope.selectedMediaFilter = sMediaName;
    $scope._refreshChartData();
  };


//User Selection options

  HistorySvc.getUsers(function(aResponse){

    // var oResponse = aResponse[1];
    // var oCurrentUser;
    // var _oUser;
    // var aUsers = Object.keys(oResponse).map(function(sAttribute){
    //   _oUser = oResponse[sAttribute];
    //   if (_oUser.USER_ID === aResponse[0][0].USER_ID){
    //     oCurrentUser = _oUser;
    //   }
    //   return _oUser; //Transform Object into an Array
    // });

    $scope.userSelection.values = aResponse.results;

    $scope.userSelection.selectedValue = aResponse.results[0];
    $scope._refreshChartData();

  });

  $scope.userSelection = {
    selectedValue : {},
    values : ''
  };

  $scope.onUserSelectionChanged = function(){
    $scope._refreshChartData();
  };

//TimeRangeSelection options
  var aMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  $scope._getSelectedTimeRangeRepresentation = function(){
    var sSelectionName = $scope.timeRangeSelection.selectedValue.name;
    var aDates = $scope.timeRangeSelection.selectedValue.value();
    if ($scope.timeRangeSelection.selectedValue.key === 'custom'){
      aDates = [];

      aDates.push(new Date($scope.timeRangeSelection.customStartDateSelection));
      aDates.push(new Date($scope.timeRangeSelection.customEndDateSelection));
    }


    if (aDates[0] === aDates[1]){
      return $scope._formatDateToUI(aDates[0]);
    }else {
      return $scope._formatDateToUI(aDates[0]) + ' - ' + $scope._formatDateToUI(aDates[1]);
    }
  };

  $scope._formatDateToUI = function(dDate){
    var sDate = dDate.getDate() < 10 ? '0' + dDate.getDate() : dDate.getDate();
    return aMonths[dDate.getMonth()] + ' ' + sDate + '.' + dDate.getFullYear();
  };

  $scope._formatDateToBE = function(dDate){
    var sMonth = dDate.getMonth() < 10 ? '0' + dDate.getMonth() : dDate.getMonth();
    var sDate = dDate.getDate() < 10 ? '0' + dDate.getDate() : dDate.getDate();

    return dDate.getFullYear() + '-' + sMonth + '-' + sDate;
  };

  var aSelectionOptions =  [{
    key:"today",
    name:"Today",
    value : function(){
      var dDate = new Date(today);
      return [dDate,dDate];
    }
  },{
    key:"yesterday",
    name:"Yesterday",
    value : function(){
      var dDate = new Date(today);
      dDate = new Date(dDate.getTime() - (24 * 60 * 60 * 1000));
      return [dDate,dDate];
    }
  },{
    key:"lastweek",
    name:"Last week",
    value : function(){
      var dEndDate = new Date(today);
      var dStartDate = new Date(dEndDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      return [dStartDate, dEndDate];
    }
  },{
    key:"last30days",
    name:"Last 30 days",
    value : function(){
      var dEndDate = new Date(today);
      var dStartDate = new Date(dEndDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      return [dStartDate, dEndDate];
    }
  },{
    key:"last6months",
    name:"Last 6 months",
    value : function(){
      var dEndDate = new Date(today);
      var dStartDate = new Date(dEndDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      return [dStartDate, dEndDate];
    }
  },{
    key:"custom",
    name:"Custom",
    value : function(){
      return [
        new Date(),//$scope.timeRangeSelection.customStartDateSelection,
        new Date()//$scope.timeRangeSelection.customEndDateSelection
      ];
    }
  }];

  $scope.timeRangeSelection = {
    selectedValue : aSelectionOptions[3], //Last 30 days
    selectedDateRepresentation : '',
    values : aSelectionOptions,
    customStartDateSelection : new Date(),
    customEndDateSelection : new Date(),
    enableCustomSelection : false
  };
  // var queryDates=[];
  // $scope.timeRangeSelection.selectedValue.value().forEach(function(d,i){
  //   queryDates.push(d.toISOString().slice(0,10));
  // });

  $scope.timeRangeSelection.selectedDateRepresentation = $scope._getSelectedTimeRangeRepresentation();

  $scope.onTimeRangeSelectionChanged = function(){
    if ($scope.timeRangeSelection.selectedValue.key === 'custom'){
      $scope.timeRangeSelection.enableCustomSelection = true;
    }else {
      $scope.timeRangeSelection.enableCustomSelection = false;
    }

    $scope._refreshChartData();
  };

  $scope._transformDatesToObject = function(aResults){
    return aResults.map(function(oResult){
      oResult.date = new Date(oResult.date);
      return oResult;
    });
  };



  $scope._refreshChartData = function(){
    $scope.timeRangeSelection.selectedDateRepresentation = $scope._getSelectedTimeRangeRepresentation();
    var aDates = $scope.timeRangeSelection.selectedValue.value();
    var sUserId = $scope.userSelection.selectedValue.USER_ID;

    /*HistorySvc.getAverageSLAChartData(
      $scope._formatDateToBE(aDates[0]), //start date
      $scope._formatDateToBE(aDates[1]), //end date
      sUserId,
      $scope.selectedMediaFilter,
      function(aResults){
        $scope.branchSLAData = $scope._transformDatesToObject(aResults);
      }
    );

    HistorySvc.getAgendaCompletionChartData(
      $scope._formatDateToBE(aDates[0]), //start date
      $scope._formatDateToBE(aDates[1]), //end date
      sUserId,
      $scope.selectedMediaFilter,
      function(aResults){
        $scope.agendaCompletionData = $scope._transformDatesToObject(aResults);
      }
    );*/
    var start = $scope.timeRangeSelection.selectedValue.value()[0];
    var end = $scope.timeRangeSelection.selectedValue.value()[1];
    if ($scope.timeRangeSelection.selectedValue.key === 'custom'){
      start = new Date($scope.timeRangeSelection.customStartDateSelection);
      end = new Date($scope.timeRangeSelection.customEndDateSelection);
    }
    HistorySvc.getAverageSLAChartData(start.toISOString().slice(0,10),end.toISOString().slice(0,10),$scope.userSelection.selectedValue.USER_ID,$scope.selectedMediaFilter,function(res){
      //console.log(res);
      var template={
        date:null,
        value:null
      };
      var data = [];
      res.results.forEach(function(d,i){
        template.date = new Date(d.DATE);
        template.value = +d.VALUE;
        data.push(deepcopy(template));
      });
      //console.log(data);
      $scope.branchSLAData = data;
    });


    HistorySvc.getAgendaCompletionChartData(start.toISOString().slice(0,10),end.toISOString().slice(0,10),$scope.userSelection.selectedValue.USER_ID,$scope.selectedMediaFilter,function(res){
      //console.log(res);
      var template={
        date:null,
        value:null
      };
      var data = [];
      res.forEach(function(d,i){
        template.date = new Date(d.date);
        template.value = +d.value;
        data.push(deepcopy(template));
      });
      //console.log(data);
      $scope.agendaCompletionData = data;
    });
    //$scope.branchSLAData = _generateDummyData();
    //$scope.agendaCompletionData = _generateDummyData();

  };


  //Enable date pickers
  $('.ItauPoCCustomDateTimePicker').datepicker({
    format: {
        toDisplay: function (date, format, language) {
            return $scope._formatDateToUI(date);
        }
    },
    autoclose: true
});

}]);
