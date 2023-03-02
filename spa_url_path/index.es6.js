/**
 * 添加自定义属性
 *
 * @param { JSON } data 数据日志
 * @param { Object } instance 当前 use 插件的实例
 * @return { JSON } 添加完毕后的数据日志
 */
function addProperties(data, instance) {
  if (data.type !== 'track') return data;
  var sd = instance.sd;
  var _ = sd._;
  var check = sd.saEvent.check;

  // 克隆数据，阻止 hookRegister 中无法对原有 data 的更改
  var copyData = _.extend2Lev({ properties: {} }, data);
  var currentProps = instance.customRegister;
  var properties = copyData.properties;
  var event = copyData.event;
  var props = {};

  _.each(currentProps, function (prop) {
    if (_.isObject(prop)) {
      if (_.indexOf(prop.events, event) > -1) {
        // 校验属性及属性值是否合法
        if (check({ properties: prop.properties })) {
          props = _.extend(props, prop.properties);
        }
      }
    } else if (_.isFunction(prop)) {
      var callbackProp = prop({
        event: event,
        properties: properties,
        data: copyData
      });
      // 校验属性及属性值是否合法
      if (_.isObject(callbackProp) && !_.isEmptyObject(callbackProp) && check({ properties: callbackProp })) {
        props = _.extend(props, callbackProp);
      }
    }
  });
  data.properties = _.extend(properties, props);
  return data;
}

function RegisterProperties() {
  this.sd = null;
  this.log = (window.console && window.console.log) || function () {};
  this.customRegister = [];
}
RegisterProperties.prototype.init = function (sd) {
  if (sd) {
    this.sd = sd;
    this._ = sd._;
    this.log = sd.log;
    var _this = this;
    sd.registerInterceptor('buildDataStage', {
      extendProps: {
        priority: 0,
        entry: function (data) {
          return addProperties(data, _this);
        }
      }
    });
  } else {
    this.log('神策JS SDK未成功引入');
  }
};

RegisterProperties.prototype.register = function (customProps) {
  if (!this.sd) {
    this.log('神策JS SDK未成功引入');
    return;
  }
  if (this._.isObject(customProps) && this._.isArray(customProps.events) && customProps.events.length > 0 && this._.isObject(customProps.properties) && !this._.isEmptyObject(customProps.properties)) {
    this.customRegister.push(customProps);
  } else {
    this.log('RegisterProperties: register 参数错误');
  }
};

RegisterProperties.prototype.hookRegister = function (customFun) {
  if (!this.sd) {
    this.log('神策JS SDK未成功引入');
    return;
  }
  if (this._.isFunction(customFun)) {
    this.customRegister.push(customFun);
  } else {
    this.log('RegisterProperties: hookRegister 参数错误');
  }
};

var sdkversion_placeholder = '_sdk_sdk_version';

function wrapPluginInitFn(plugin, name, lifeCycle) {
  if (name) {
    plugin.plugin_name = name;
  }
  if (lifeCycle && plugin.init) {
    var initFn = plugin.init;
    plugin.init = function (sd, option) {
      if ((sd.readyState && sd.readyState.state >= 3) || !sd.on) {
        return initPlugin();
      }
      sd.on(lifeCycle, initPlugin);
      function initPlugin() {
        initFn.call(plugin, sd, option);
      }
    };
  }
  return plugin;
}

function createPlugin(plugin, name, lifeCycle) {
  wrapPluginInitFn(plugin, name, lifeCycle);
  plugin.plugin_version = sdkversion_placeholder;
  return plugin;
}

RegisterProperties.prototype.plugin_name = 'RegisterProperties';
var instance = new RegisterProperties();

var rgp = createPlugin(instance);

var spaURLPath = {
  plugin_name: 'SpaUrlPath',
  init: function (sd) {
    var registerPlugin = sd.use(rgp);
    registerPlugin.hookRegister(function () {
      var spa_path_value = '';
      if (location.search !== '') {
        spa_path_value = location.pathname;
      } else {
        spa_path_value = location.pathname + location.hash.split('?')[0];
      }
      return {
        spa_url_path: spa_path_value
      };
    });
  }
};

export default spaURLPath;
