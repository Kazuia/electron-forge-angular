(function () {
    'use strict';

    angular
        .module('efangular.sample')
        .controller('SampleController', SampleController);

    SampleController.$inject = [];
    /* @ngInject */
    function SampleController() {
        var vm = this;
        vm.title = 'Sample';
        vm.notify = notify;

        activate();

        function activate() {
            console.log('Activated Add View');
        }

        function notify() {
          new Notification('Notif added',
            {
              body: "You added a notif for : Item #0",
              icon: 'img/icon.ico'
            }
          );
        }
    }
})();
