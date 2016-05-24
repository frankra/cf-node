angular.module("MessagesApp",[]).controller("MainController",['$http','$scope',function($http,$scope) {

  $scope.messages = [];
  $scope.newMessage = {};

  $scope.loadMessages = function(){
    return $http.get('/api/Messages').then(response=>{
      $scope.messages = response.data;
    }).catch(e=>{
      console.error('Error loading messages: ',e.stack);
    })
  }

  $scope.deleteById = function(messageId){
    return $http.delete('/api/Messages/' + messageId).then(response=>{
      return response;
    }).then(response=>{
      return $scope.loadMessages();
    }).catch(e=>{
      console.error('Error loading messages: ',e.stack);
    })
  }

  $scope.sendMessage = function(message){
    return $http.post('/api/Messages',message).then(response=>{
      return response;
    }).then(response=>{
      $scope.newMessage = {};
      return $scope.loadMessages();
    }).catch(e=>{
      console.error('Error loading messages: ',e.stack);
    })
  }

  $scope.loadMessages();
}]);
