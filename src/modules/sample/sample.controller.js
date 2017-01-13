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
        vm.animate = animate;

        activate();

        function activate() {
            console.log('Activated Add View');
            vm.effect = 'bounce';
        }

        function notify() {
          new Notification('Notification title',
            {
              body: "An example of notification!",
              icon: 'img/icon.ico'
            }
          );
        }

        function animate(type) {
          vm.bounce = false;
          vm.swing = false;
          vm.flash = false;

          console.log(type);

          if (type === 'bounce') {vm.bounce = true;}
          else if(type === 'flash') {vm.flash = true;}
          else if(type === 'swing') {vm.swing = true;}
        }
    }
})();
