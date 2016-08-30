'use strict';
/**
 * @description
 * This is the bulb-preview directive.
 */
export function BulbPreview() {
  'ngInject';

  let directive = {
    scope: {
      // characteristics
    },
    restrict: 'EA',
    controller: BulbPreviewController,
    controllerAs: '$ctrl',
    templateUrl: 'app/components/directives/bulb-preview/bulb-preview.views/bulb-preview.view.html',
    bindToController: true
  };

  return directive;
}

class BulbPreviewController {
  constructor($rootScope) {
    'ngInject';
    this.characteristics = null;
  }
}
