'use strict';
/**
 * @description
 * This is the sb2-datasource-loading directive.
 */
export function BulbPreview() {
  'ngInject';

  let directive = {
    scope: {},
    restrict: 'EA',
    controller: BulbPreviewController,
    controllerAs: '$ctrl',
    templateUrl: 'app/components/directives/datasource-loading/datasource-loading.views/datasource-loading.view.html',
    bindToController: true
  };

  return directive;
}

class BulbPreviewController {
  constructor($rootScope, EventRegistrationService) {
    'ngInject';
    let self = this;
    self.loading = false;
    EventRegistrationService.register({
      eventNames: ['$stateChangeStart', '$stateChangeSuccess'],
      fromScope: $rootScope,
      toScope: $rootScope,
      callback: (event, toState) => {
        if (toState.name === 'data.editor') {
          self.loading = !self.loading;
        }
      }
    });
  }
}
