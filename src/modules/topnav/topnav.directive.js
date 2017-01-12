(function() {
    'use strict';

    angular
        .module('efangular.topnav')
        .directive('topNav', htTopNav);

    /* @ngInject */
    function htTopNav () {
        var directive = {
            bindToController: true,
            controller: TopNavController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {
                'navline': '='
            },
            templateUrl: 'modules/topnav/topnav.html'
        };

        /* @ngInject */
        function TopNavController() {
            let vm = this;
            vm.min = min;
            vm.max = max;
            vm.close = close;

            const remote = require('electron').remote;
            let window = remote.getCurrentWindow();
            vm.maximizeState = window.isMaximized();

            activate();

            function activate() {
                console.log('Activated Topnav View');
            }

            function min() {
                 window.minimize();
            };

            function max() {
              if (!window.isMaximized()) {
                  window.maximize();
                  vm.maximizeState = window.isMaximized();
              } else {
                  window.unmaximize();
                  vm.maximizeState = window.isMaximized();
              }
            };

            function close() {
              window.close();
            };
        }

        return directive;
    }
})();
