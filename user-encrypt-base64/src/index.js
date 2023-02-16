import { createPlugin } from '../plugin-create';

var userEncryptBase64 = {
  init: function (sd, option) {
    var isString = sd._.isString;
    var isObject = sd._.isObject;
    var isBoolean = sd._.isBoolean;
    var base64Decode = sd._.base64Decode;
    var base64Encode = sd._.base64Encode;

    var flag = 'b64-enc-';
    if (isObject(option) && isBoolean(option.encrypt_cookie)) {
      sd.ee.sdk.on('initPara', function () {
        sd.para.encrypt_cookie = option.encrypt_cookie;
      });
    }

    sd.ee.sdk.on('afterInitPara', function () {
      sd.kit.userEncrypt = function (v) {
        return flag + base64Encode(v);
      };
      sd.kit.userDecrypt = function (v) {
        if (v.indexOf(flag) === 0) {
          v = v.substring(flag.length);
          v = base64Decode(v);
        }
        return v;
      };
      sd.kit.userDecryptIfNeeded = function (cross) {
        if (isString(cross) && cross.indexOf(flag) === 0) {
          cross = sd.kit.userDecrypt(cross);
        }
        return cross;
      };
    });
  },
  plugin_name: 'UserEncryptBase64'
};

export default createPlugin(userEncryptBase64);
