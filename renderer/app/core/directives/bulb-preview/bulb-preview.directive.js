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
    this.transclude = true;
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
  constructor($scope, $log, bulbDeviceService) {
    'ngInject';
    this.color = 'rgba(0,0,0,0)';
    this.style = '';
    this.$log = $log;
    this.bulbDeviceService = bulbDeviceService;
    // this.$log.debug('BulbPreviewController bulbPreviewCharacteristics', this.characteristics);
  }

  getStyle() {
    this.$log.debug('getStyle', this.characteristics, this.isColor());
    if (this.isColor()) {
      this.$log.debug('color');
      if (this.characteristics.color.data) {
        let colorArray = this.characteristics.color.data;
        let color = [
          colorArray[1],
          colorArray[2],
          colorArray[3],
          ((255 - colorArray[0]) / 255).toFixed(2)
        ].join(', ');
        this.color = `rgba(${color})`;
      }
      this.style = {
        'background-color': this.color
      };
    } else if (this.isEffect()) {
      // this.$log.debug('effect');
    } else {
      // this.$log.debug('No characteristics discovered');
      this.$log.warn('No characteristics discovered');
    }

    this.$log.debug(this.style);
    return this.style;
  }

  isColor() {
    return this.bulbDeviceService.isColor(this.characteristics);
  }

  isEffect() {
    return this.bulbDeviceService.isEffect(this.characteristics);
  }
}
