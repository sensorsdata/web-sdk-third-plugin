var sdkversion_placeholder="1.24.12";function wrapPluginInitFn(n,e,t){if(e&&(n.plugin_name=e),t&&n.init){var i=n.init;n.init=function(e,r){if(e.readyState&&e.readyState.state>=3||!e.on)return a();function a(){i.call(n,e,r)}e.on(t,a)}}return n}function createPlugin(n,e,t){return wrapPluginInitFn(n,e,t),n.plugin_version=sdkversion_placeholder,n}var userEncryptBase64={init:function(n,e){var t=n._.isString,i=n._.isObject,r=n._.isBoolean,a=n._.base64Decode,c=n._.base64Encode,u="b64-enc-";i(e)&&r(e.encrypt_cookie)&&n.ee.sdk.on("initPara",function(){n.para.encrypt_cookie=e.encrypt_cookie}),n.ee.sdk.on("afterInitPara",function(){n.kit.userEncrypt=function(n){return u+c(n)},n.kit.userDecrypt=function(n){return 0===n.indexOf(u)&&(n=n.substring(u.length),n=a(n)),n},n.kit.userDecryptIfNeeded=function(e){return t(e)&&0===e.indexOf(u)&&(e=n.kit.userDecrypt(e)),e}})},plugin_name:"UserEncryptBase64"},index=createPlugin(userEncryptBase64);export default index;