'use strict';
/**
 * @description
 * This is the bulb-preview directive.
 */

export class BulbPreview {
  constructor($log) {
    'ngInject';

    this.scope = {
      characteristics: '=bulbPreviewCharacteristics'
    };
    this.restrict = 'EA';
    this.controller = BulbPreviewController;
    this.controllerAs = '$ctrl';
    this.templateUrl = 'app/core/directives/bulb-preview/bulb-preview.views/bulb-preview.view.html';
    this.bindToController = true;
  }

  link(scope, element, attributes) {
    // console.info('BulbPreviewController link', scope, element, attributes);
    // console.info(this.characteristics);
    // console.info(this.scope.characteristics);
    // console.info(this.scope.characteristics.color.data);
    // let color = '#fff';
    // element[0].style.backgroundColor = color;
  }

  // static directiveFactory($q, bookShelfSvc) {
  //   BulbPreview.instance = new BulbPreview();
  //   return BulbPreview.instance;
  // }
}

// BulbPreview.directiveFactory.$inject = [];
//
// // let moduleName = BulbPreview.directiveFactory;
// export BulbPreview = () => {
//   new BulbPreview();
// };
class BulbPreviewController {
  constructor($scope, $log) {
    'ngInject';
    console.info(this, $log);
    this.$log = $log;
    this.$log.debug('BulbPreviewController bulbPreviewCharacteristics', this.characteristics);
  }

  getColor() {
    let color = [
      this.characteristics.color.data.data[1],
      this.characteristics.color.data.data[2],
      this.characteristics.color.data.data[3],
      // (255 - this.characteristics.color.data.data[0])
      100
    ].join(', ');
    this.$log.debug(`rgba(${color})`);
    return `rgba(${color})`;
  }
}
