import rgp from '../register-properties/index';
var spaURLPath = {
  plugin_name: 'SpaUrlPath',
  init: function (sd) {
    var registerPlugin = sd.use(rgp);
    registerPlugin.hookRegister(function () {
      var spa_path_value = '';
      if (location.search !== '') {
        spa_path_value = location.pathname;
      } else {
        spa_path_value = location.pathname + location.hash.split('?')[0]
      }
      return {
        spa_url_path: spa_path_value
      };
    });
  }
}
export default spaURLPath;