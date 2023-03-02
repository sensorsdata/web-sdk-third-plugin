/**
 * @author shengyonggen@sensorsdata.cn
 * @description 插件演示 demo
 * @description 有问题，可以在 issue 中提问，或者联系邮箱，或者联系微信群
 */

// 自动发送 helloworld 事件的插件
var plugin = {
  plugin_name: 'demo-helloworld',
  init: function (sd) {
    sd.ee.sdk.on('ready', function () {
      sd.track('helloworld');
    });
  }
};

export default plugin;