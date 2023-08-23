import { createPlugin } from '../plugin-create';
var getTitleByDescriptionMeta = {
  plugin_name: 'getTitleByDescriptionMeta',
  getTitle: function () {
    var title = '';
    if (!document.querySelectorAll) {
      return '当前浏览器版本太低';
    }
    var targetObj = document.querySelectorAll("head meta[name='description']");
    if (targetObj && targetObj[0] && targetObj[0].getAttribute('content')) {
      title = targetObj[0].getAttribute('content');
    }
    return title;
  },
  init: function (sd) {
    var title = this.getTitle();
    sd.ee.sdk.on('afterInitAPI', function () {
      sd.registerPropertyPlugin({
        isMatchedWithFilter: function (data) {
          return data.type === 'track';
        },
        properties: function (data) {
          if (sd._.isString(data.properties.$title)) {
            data.properties.$title = title;
          }
        }
      });
    });
  }
}

export default createPlugin(getTitleByDescriptionMeta);