var app = angular.module('portal-signup', []);

app.controller('portal-signup-controller', ['$scope', function($scope) {
  // API key for resume_portal
  filepicker.setKey('AVRqlhXowRme6yNY2qmrdz');
  
  var policy = {"expiry":1350465080,"call":["pick", "read"]};
  
  $scope.setGender = function(string) {
    if(string == 'male' || string == 'female') {
      $scope.registration.gender = string;
    }
  }
  
  $scope.formValid = function() {
    var r = $scope.registration;
    return    r.name
           && r.name.first
           && r.name.last
           && (r.email
               && r.email.indexOf('@') > 0
               && r.email.indexOf('northwestern.edu') > 0)
           && (r.school
               && (r.school == 'mccormick'
                   || r.school == 'weinburg'
                   || r.school == 'sesp'
                   || r.school == 'medill'
                   || r.school == 'bienen'
                   || r.school == 'comm'
                   || r.school == 'kellogg'
                   || r.school == 'tgs'))
           && (r.year
               && (r.year == 'Freshman'
                   || r.year == 'Sophomore'
                   || r.year == 'Junior'
                   || r.year == 'Senior'
                   || r.year == 'Graduate Student'
                   || (r.year == 'Other'
                       && r.yearOtherExplanation)))
           && typeof(r.resume) == "object"
           && (r.gender == 'male' || r.gender == 'female')
           && (r.seeking.fulltime
               || r.seeking.internship)
           && r.major;
  };
  
  $scope.formIsFilledOut = function() {
    var r = $scope.registration;
    return r.name.first
           && r.name.last
           && r.email
           && r.school
           && r.year
           && r.resume
           && r.gender
           && r.major;
  }
  
  $scope.pickFile = function() {
    filepicker.pick({
      mimetypes: ['text/plain',
                  'text/richtext',
                  'application/pdf',
                  'text/pdf'],
      container: 'modal',
      services: ['COMPUTER', 'GMAIL', 'BOX', 'DROPBOX', 'GOOGLE_DRIVE', 'SKYDRIVE', 'EVERNOTE', 'CLOUDDRIVE'],
    },
    function(InkBlob) {
      console.log(InkBlob);
      $scope.$apply(function() {
        // do updates to scope here
        $scope.uploadedFilename = InkBlob.filename;
        $scope.registration.resume = InkBlob;
      });
      filepicker.read(InkBlob,
         function(data) {
        // could do:
        //$http.put('', data);
        
      }, function(FPError) {
        
      }, function(percent) {
        
      });
    },
    function(PFError) {
      console.log(PFError.toString());
    });
  }
}]);