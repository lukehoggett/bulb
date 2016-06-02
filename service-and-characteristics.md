```js
Services [ 
  Service {
    _peripheralId: 'ace64b055ff9',
    uuid: '1800',
    name: 'Generic Access',
    type: 'org.bluetooth.service.generic_access',
    includedServiceUuids: null,
    characteristics: [ 
      Characteristic {
        _peripheralId: 'ace64b055ff9',
        _serviceUuid: '1800',
        uuid: '2a00',
        name: 'Device Name',
        type: 'org.bluetooth.characteristic.gap.device_name',
        properties: [ 'read', 'write' ],
        descriptors: null 
      },
      Characteristic {
        _peripheralId: 'ace64b055ff9',
        _serviceUuid: '1800',
        uuid: '2a01',
        name: 'Appearance',
        type: 'org.bluetooth.characteristic.gap.appearance',
        properties: [ 'read' ],
        descriptors: null 
      },
      Characteristic {
        _peripheralId: 'ace64b055ff9',
        _serviceUuid: '1800',
        uuid: '2a04',
        name: 'Peripheral Preferred Connection Parameters',
        type: 'org.bluetooth.characteristic.gap.peripheral_preferred_connection_parameters',
        properties: [ 'read' ],
        descriptors: null 
      }
    ],
  },
  Service {
    _peripheralId: 'ace64b055ff9',
    uuid: '1801',
    name: 'Generic Attribute',
    type: 'org.bluetooth.service.generic_attribute',
    includedServiceUuids: null,
    characteristics: [],
  Service {
    _peripheralId: 'ace64b055ff9',
    uuid: 'ff02',
    name: null,
    type: null,
    includedServiceUuids: null,
    characteristics: [ 
      Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: '2a37',
       name: 'Heart Rate Measurement',
       type: 'org.bluetooth.characteristic.heart_rate_measurement',
       properties: [ 'notify' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fff8',
       name: null,
       type: null,
       properties: [ 'read' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fff9',
       name: null,
       type: null,
       properties: [ 'read', 'write' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fffa',
       name: null,
       type: null,
       properties: [ 'read', 'writeWithoutResponse' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fffb',
       name: null,
       type: null,
       properties: [ 'read', 'writeWithoutResponse' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fffc',
       name: null,
       type: null,
       properties: [ 'read', 'writeWithoutResponse' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fffd',
       name: null,
       type: null,
       properties: [ 'read', 'write' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'fffe',
       name: null,
       type: null,
       properties: [ 'read', 'write' ],
       descriptors: null },
     Characteristic {
       _peripheralId: 'ace64b055ff9',
       _serviceUuid: 'ff02',
       uuid: 'ffff',
       name: null,
       type: null,
       properties: [ 'read', 'write' ],
       descriptors: null } ],
  Service {
    _peripheralId: 'ace64b055ff9',
    uuid: '180f',
    name: 'Battery Service',
    type: 'org.bluetooth.service.battery_service',
    includedServiceUuids: null,
    characteristics: [ Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180f',
      uuid: '2a19',
      name: 'Battery Level',
      type: 'org.bluetooth.characteristic.battery_level',
      properties: [ 'read', 'notify' ],
      descriptors: null } ],
  Service {
    _peripheralId: 'ace64b055ff9',
    uuid: '180a',
    name: 'Device Information',
    type: 'org.bluetooth.service.device_information',
    includedServiceUuids: null,
    characteristics: [ Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a25',
      name: 'Serial Number String',
      type: 'org.bluetooth.characteristic.serial_number_string',
      properties: [ 'read' ],
      descriptors: null },
    Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a27',
      name: 'Hardware Revision String',
      type: 'org.bluetooth.characteristic.hardware_revision_string',
      properties: [ 'read' ],
      descriptors: null },
    Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a26',
      name: 'Firmware Revision String',
      type: 'org.bluetooth.characteristic.firmware_revision_string',
      properties: [ 'read' ],
      descriptors: null },
    Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a28',
      name: 'Software Revision String',
      type: 'org.bluetooth.characteristic.software_revision_string',
      properties: [ 'read' ],
      descriptors: null },
    Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a29',
      name: 'Manufacturer Name String',
      type: 'org.bluetooth.characteristic.manufacturer_name_string',
      properties: [ 'read' ],
      descriptors: null },
    Characteristic {
      _peripheralId: 'ace64b055ff9',
      _serviceUuid: '180a',
      uuid: '2a50',
      name: 'PnP ID',
      type: 'org.bluetooth.characteristic.pnp_id',
      properties: [ 'read' ],
      descriptors: null } ],
    _events: {},
    _eventsCount: 0 } ]
```



## Service Type: Generic Access [0x1800]


### Characteristic Type: Device Name [0x2a00]
Type: name
Service UUID 1800 
Characteristic UUID 2a00 
DATA <Buffer 30 35> 
DATA JSON { type: 'Buffer', data: [ 48, 53 ] } 
DATA STRING 05

### Characteristic Type: Appearance [0x2a01]
Type: 
Service UUID 1800 
Characteristic UUID 2a01 
DATA <Buffer 40 03> 
DATA JSON { type: 'Buffer', data: [ 64, 3 ] } 
DATA STRING @

### Characteristic Type: Peripheral Preferred Connection Parameters [0x2a04]
Service UUID 1800 
Characteristic UUID 2a04 
DATA <Buffer 10 00 20 00 00 00 58 02> 
DATA JSON { type: 'Buffer', data: [ 16, 0, 32, 0, 0, 0, 88, 2 ] } 
DATA STRING  X

## Service Type: Device Information [0x180a]

### Characteristic Type: Serial Number String [0x2a25]
Service UUID 180a 
Characteristic UUID 2a25 
DATA <Buffer 42 54 4c 33 30 30> 
DATA JSON { type: 'Buffer', data: [ 66, 84, 76, 51, 48, 48 ] } 
DATA STRING BTL300

### Characteristic Type: Firmware Revision String [0x2a26] 
Service UUID 180a 
Characteristic UUID 2a26 
DATA <Buffer 42 54 4c 33 30 30 5f 76 35> 
DATA JSON { type: 'Buffer', data: [ 66, 84, 76, 51, 48, 48, 95, 118, 53 ] } 
DATA STRING BTL300_v5

### Characteristic Type: Hardware Revision String [0x2a27]
Service UUID 180a 
Characteristic UUID 2a27 
DATA <Buffer 43 53 52 31 30 31 78 20 41 30 35> 
DATA JSON { type: 'Buffer', data: [ 67, 83, 82, 49, 48, 49, 120, 32, 65, 48, 53 ] } 
DATA STRING CSR101x A05

### Characteristic Type: Software Revision String [0x2a28]
Service UUID 180a 
Characteristic UUID 2a28 
DATA <Buffer 41 70 70 6c 69 63 61 74 69 6f 6e 20 76 65 72 73 69 6f 6e 20 32 2e 33 2e 30 2e 33 31> 
DATA JSON { type: 'Buffer', data: [ 65,112,112,108,105,99,97,116,105,111,110,32,118,101,114,115,105,111,110,32,50,46,51,46,48,46,51,49 ] } 
DATA STRING Application version 2.3.0.31

### Characteristic Type: Manufacturer Name String [0x2a29]
Service UUID 180a 
Characteristic UUID 2a29 
DATA <Buffer 4d 69 70 6f 77 20 4c 69 6d 69 74 65 64> 
DATA JSON { type: 'Buffer', data: [ 77, 105, 112, 111, 119, 32, 76, 105, 109, 105, 116, 101, 100 ] } 
DATA STRING Mipow Limited

### Characteristic Type: PnP ID [0x2a50]
Service UUID 180a 
Characteristic UUID 2a50 
DATA <Buffer 01 0a 00 4c 01 00 01> 
DATA JSON { type: 'Buffer', data: [ 1, 10, 0, 76, 1, 0, 1 ] } 
DATA STRING 
L

## Service Type: Battery Service [0x180f]

### Characteristic Type: Battery Level [2a19]
Service UUID 180f 
Characteristic UUID 2a19 
DATA <Buffer 4f> 
DATA JSON { type: 'Buffer', data: [ 79 ] } 
DATA STRING O

## Service Type: Mipow [0xff02]

### Characteristic Type: Heart Rate Measurement [0x2a37]
Service UUID ff02 
Characteristic UUID 2a37 
DATA <Buffer > 
DATA JSON { type: 'Buffer', data: [] } 
DATA STRING 

### Characteristic Type: [fff8]
Service UUID ff02 
Characteristic UUID fff8 
DATA <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00> 
DATA JSON { type: 'Buffer', data: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] } 
DATA STRING 

### Characteristic Type: [fff9]
Service UUID ff02 
Characteristic UUID fff9 
DATA <Buffer 00 00 00 ff ff ff ff 00 00 00 00 00 00> 
DATA JSON { type: 'Buffer', data: [ 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0 ] } 
DATA STRING ����

### Characteristic Type: [fffa]
Service UUID ff02 
Characteristic UUID fffa 
DATA <Buffer 00> 
DATA JSON { type: 'Buffer', data: [ 0 ] } 
DATA STRING 

### Characteristic Type: Effects [0xfffb]
Service UUID ff02 
Characteristic UUID fffb 
DATA <Buffer 00 ff 00 93 03 00 0a 00> 
DATA JSON { type: 'Buffer', data: [ 0, 255, 0, 147, 3, 0, 10, 0 ] } 
DATA STRING ��

### Characteristic Type: Color [0xfffc]
Service UUID ff02 
Characteristic UUID fffc 
DATA <Buffer 00 00 00 00> 
DATA JSON { type: 'Buffer', data: [ 0, 0, 0, 0 ] } 
DATA STRING 

### Characteristic Type: [fffd]
Service UUID ff02 
Characteristic UUID fffd 
DATA <Buffer 03 27 8a 0a> 
DATA JSON { type: 'Buffer', data: [ 3, 39, 138, 10 ] } 
DATA STRING '�

### Characteristic Type: [fffe]
Service UUID ff02 
Characteristic UUID fffe 
DATA <Buffer 04 ff ff 04 ff ff 04 ff ff 04 ff ff 00 00> 
DATA JSON { type: 'Buffer', data: [ 4, 255, 255, 4, 255, 255, 4, 255, 255, 4, 255, 255, 0, 0 ] } 
DATA STRING ��������

### Characteristic Type: Name [0xffff]
Service UUID ff02 
Characteristic UUID ffff 
DATA <Buffer 30 35> 
DATA JSON { type: 'Buffer', data: [ 48, 53 ] } 
DATA STRING 05
 
