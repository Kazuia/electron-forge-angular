(function () {
    'use strict';

    angular
        .module('efangular.home')
        .controller('HomeController', HomeController);

    HomeController.$inject = [];
    /* @ngInject */
    function HomeController() {
        var vm = this;
        vm.title = 'Home';
        vm.goToRepo = goToRepo;
        const shell = require('electron').shell;

        activate();

        function activate() {
            console.log('Activated Home View');
        }

        function goToRepo() {
          shell.openExternal('https://github.com/Kazuia/electron-forge-angular');
        }

    }
})();
