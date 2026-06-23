// College Portal AngularJS Application
angular.module('CollegeApp', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: '/partials/dashboard',
                controller: 'DashboardCtrl'
            })
            .when('/courses', {
                templateUrl: '/partials/courses',
                controller: 'CoursesCtrl'
            })
            .when('/grades', {
                templateUrl: '/partials/grades',
                controller: 'GradesCtrl'
            })
            .when('/notices', {
                templateUrl: '/partials/notices',
                controller: 'NoticesCtrl'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });
    }])

    .controller('DashboardCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.enrollments = [];
        $scope.filterDept = '';

        $http.get('/api/enrollments').then(function(response) {
            $scope.enrollments = response.data;
        });

        $scope.dropCourse = function(courseId) {
            $http.delete('/api/enrollments/' + courseId).then(function() {
                $scope.enrollments = $scope.enrollments.filter(function(e) {
                    return e.id !== courseId;
                });
            });
        };
    }])

    .controller('CoursesCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.courses = [];
        $scope.search = '';
        $scope.filterRole = '';

        $http.get('/api/courses').then(function(response) {
            $scope.courses = response.data;
        });

        $scope.enroll = function(courseId) {
            $http.post('/api/enrollments', { courseId: courseId }).then(function() {
                var course = $scope.courses.find(function(c) { return c.id === courseId; });
                if (course) course.enrolled = true;
            });
        };
    }])

    .controller('GradesCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.grades = [];
        $scope.searchCourse = '';

        $http.get('/api/grades').then(function(response) {
            $scope.grades = response.data;
        });

        Object.defineProperty($scope, 'gpa', {
            get: function() {
                if ($scope.grades.length === 0) return 0;
                var total = $scope.grades.reduce(function(sum, grade) {
                    return sum + (grade.grade || 0);
                }, 0);
                return (total / $scope.grades.length).toFixed(2);
            }
        });
    }])

    .controller('NoticesCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.notices = [];
        $scope.searchKeyword = '';

        $http.get('/api/notices').then(function(response) {
            $scope.notices = response.data;
        });

        $scope.pinNotice = function(id) {
            $http.put('/api/notices/' + id + '/pin').then(function() {
                var notice = $scope.notices.find(function(n) { return n.id === id; });
                if (notice) notice.pinned = true;
            });
        };

        $scope.deleteNotice = function(id) {
            $http.delete('/api/notices/' + id).then(function() {
                $scope.notices = $scope.notices.filter(function(n) { return n.id !== id; });
            });
        };
    }]);