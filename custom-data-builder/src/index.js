import { createPlugin } from '../plugin-create';

function CustomDataBuilder() {
  this.para = {
    distinct_id: null,
    is_login_id: false,
    server_url: '',
    send_type: 'beacon',
    login_id: null
  };
  this.log = (console && console.log) || function () {};
  this.sd = null;
  this.identities = {};
}

CustomDataBuilder.prototype.initPara = function (sd, para) {
  this.sd = sd;
  this.log = (sd && sd.log) || this.log;
  this.check = sd.saEvent.check;
  this._ = sd._;
  if (this.check({ distinct_id: para.distinct_id })) {
    this.para.distinct_id = para.distinct_id;
  }
  if (para.is_login_id === true) {
    this.para.is_login_id = true;
  }

  if (this._.isString(para.server_url)) {
    this.para.server_url = this._.optimizeServerUrl(para.server_url);
  }
  if (this.para.server_url === '') {
    // 如果未配置,则使用主 SDK 的 server_url
    var server_url = this.sd.para.server_url;
    if (this._.isArray(server_url)) {
      this.para.server_url = server_url[0] || '';
    } else if (this._.isString(server_url)) {
      this.para.server_url = server_url;
    }
  }

  // 仅支持单条发送。默认：beacon
  if (['image', 'beacon', 'ajax'].indexOf(para.send_type) > -1) {
    this.para.send_type = para.send_type;
  }
};
CustomDataBuilder.prototype.init = function (sa) {
  if (!sa || this.sd) {
    this.log('CustomDataBuilder Plugin initialization failed.');
    return false;
  }

  this.sd = sa;
  this.log = (sa && sa.log) || this.log;
  this.check = sa.saEvent.check;
  this._ = sa._;

  for (var key in emptyFn) {
    this[key] = emptyFn[key];
  }
};

CustomDataBuilder.prototype.createInstance = function (para) {
  var instance = new CustomDataBuilder();
  // 如果传入 主SDK 则使用传入的主 SDK，否则使用初始化插件时的 SDK
  var sd = this._.isObject(para.sensors) ? para.sensors : this.sd;
  instance.initPara(sd, para);
  if (!instance.para.distinct_id) {
    instance.log('CustomDataBuilder Plugin initialization failed. parameter [distinct_id] error.', instance.para.distinct_id);
    // 初始化失败将 API 置空
    for (var key in emptyFn) {
      instance[key] = emptyFn[key];
    }
  }
  return instance;
};

CustomDataBuilder.prototype.track = function (e, p) {
  if (this.check({ event: e, properties: p })) {
    var data = {
      type: 'track',
      event: e,
      properties: this._.extend(
        {},
        this.sd._.info.properties(), // 预置属性
        {
          $url: this._.getURL(),
          $title: document.title,
          $is_login_id: this.para.is_login_id
        },
        p // 自定义属性
      )
    };
    if (!this._.isEmptyObject(this.identities)) {
      this._.extend(data, { identities: this.identities });
    }

    this.sendEvent(data);
  }
};

CustomDataBuilder.prototype.bind = function (ids) {
  if (!this._.isObject(ids)) {
    this.log('the identities is invalid，the identities type must be Object.');
    return false;
  }
  var id_count = 0;
  var identities = {};
  var _this = this;
  this._.each(ids, function (itemValue, itemName) {
    if (!_this.check({ bindKey: itemName, bindValue: itemValue })) {
      return false;
    }
    identities[itemName] = itemValue;
    id_count++;
  });

  if (id_count < 2) {
    this.log('the identities is invalid，you should have at least two identities.');
    return;
  }

  if (this.para.login_id) {
    identities['$identity_login_id'] = this.para.login_id;
  }
  this._.extend(this.identities, identities);
  this.sendEvent({
    type: 'track_id_bind',
    event: '$BindID',
    properties: this._.extend(
      {},
      this.sd._.info.properties(), // 预置属性
      {
        $url: this._.getURL(),
        $title: document.title,
        $is_login_id: this.para.is_login_id
      }
    ),
    identities: identities
  });
};

CustomDataBuilder.prototype.unbind = function (name, value) {
  if (!this.check({ unbindKey: name, bindValue: value })) {
    return false;
  }
  if (this.identities[name] && this.identities[name] === value) {
    delete this.identities[name];
  }
  var identities = {};
  identities[name] = value;
  this.sendEvent({
    identities: identities,
    type: 'track_id_unbind',
    event: '$UnbindID',
    properties: this._.extend(
      {},
      this.sd._.info.properties(), // 预置属性
      {
        $url: this._.getURL(),
        $title: document.title,
        $is_login_id: this.para.is_login_id
      }
    )
  });
};

CustomDataBuilder.prototype.setProfile = function (p) {
  if (
    this.check({
      propertiesMust: p
    })
  ) {
    var data = {
      type: 'profile_set',
      properties: this._.extend(
        {},
        {
          $is_login_id: this.para.is_login_id
        },
        p
      )
    };

    if (!this._.isEmptyObject(this.identities)) {
      this._.extend(data, { identities: this.identities });
    }
    this.sendEvent(data);
  }
};

CustomDataBuilder.prototype.login = function (login_id) {
  if (!this.check({ distinct_id: login_id })) {
    this.log('login_id id is invalid');
    return false;
  }

  if (login_id === this.para.distinct_id && !this.para.is_login_id) {
    this.log('login id is equal to distinct_id');
    return;
  }

  var data = {
    type: 'track_signup',
    event: '$SignUp',
    original_id: this.para.distinct_id,
    properties: this._.extend(
      {},
      this.sd._.info.properties(), // 预置属性
      {
        $url: this._.getURL(),
        $title: document.title,
        $is_login_id: this.para.is_login_id
      }
    )
  };

  if (!this._.isEmptyObject(this.identities)) {
    this._.extend(data, { identities: this.identities });
  }

  this.para.distinct_id = login_id;
  this.para.login_id = login_id;
  this.sendEvent(data);

  this.para.is_login_id = true;
};

CustomDataBuilder.prototype.sendEvent = function (p) {
  var _this = this;
  var _ = this._;
  var sd = this.sd;

  if (!_.isObject(p)) {
    this.log('data is invalid');
    return;
  }
  var data = {
    distinct_id: this.para.distinct_id,
    lib: {
      $lib: 'js',
      $lib_method: 'code',
      $lib_version: String(sd.lib_version)
    },
    time: new Date() * 1
  };
  _.extend(data, p);

  this.formatData(data);

  data._track_id = Number(String(_.getRandom()).slice(2, 5) + String(_.getRandom()).slice(2, 4) + String(new Date().getTime()).slice(-4));
  data._flush_time = new Date().getTime();
  if (!this.para.server_url) {
    this.log('当前 server_url 为空或不正确，只在控制台打印日志，network 中不会发数据，请配置正确的 server_url！');
  }
  this.log(data);

  function getSendUrl(url, data) {
    var dataStr = sd.kit.encodeTrackData(data);
    if (url.indexOf('?') !== -1) {
      return url + '&' + dataStr;
    }
    return url + '?' + dataStr;
  }

  var sender = {
    getInstance: function (requestData) {
      if (_this.para.send_type === 'beacon' && _.isSupportBeaconSend()) {
        requestData.data = sd.kit.encodeTrackData(requestData.data);
        return new _.BeaconSend(requestData);
      }
      if (_this.para.send_type === 'ajax' && _.isSupportCors()) {
        requestData.data = sd.kit.encodeTrackData(requestData.data);
        return new _.AjaxSend(requestData);
      }
      // image 发送 相同资源只会请求一次
      requestData.data.time = new Date() * 1;
      requestData.data = getSendUrl(requestData.server_url, requestData.data);
      return new _.ImageSend(requestData);
    },
    sendCall: function (rqData) {
      var instance = sender.getInstance(rqData);
      instance.start();
    }
  };
  if (!this.para.server_url) {
    return;
  }
  var requestData = {
    data: data,
    server_url: this.para.server_url
  };
  sender.sendCall(requestData);
};

CustomDataBuilder.prototype.formatData = function (data) {
  var p = data.properties;
  var _this = this;
  var _ = this._;
  var sdWarn = function () {
    _this.sd.logger.msg.apply(_this.sd, arguments).level('warn').log();
  };

  function parseSuperProperties(data) {
    var obj = data.properties;
    var copyData = JSON.parse(JSON.stringify(data));
    if (_.isObject(obj)) {
      _.each(obj, function (objVal, key) {
        if (_.isFunction(objVal)) {
          try {
            obj[key] = objVal(copyData);
            if (_.isFunction(obj[key])) {
              sdWarn('您的属性- ' + key + ' 格式不满足要求，我们已经将其删除');
              delete obj[key];
            }
          } catch (e) {
            delete obj[key];
            sdWarn('您的属性- ' + key + ' 抛出了异常，我们已经将其删除');
          }
        }
      });
    }
  }

  function strip_sa_properties(p, ignores) {
    if (!_.isObject(p)) {
      return p;
    }
    _.each(p, function (v, k) {
      // 如果是数组，把值自动转换成string
      if (_.isArray(v)) {
        var temp = [];
        _.each(v, function (arrv) {
          if (_.isString(arrv)) {
            temp.push(arrv);
          } else if (_.isUndefined(arrv)) {
            temp.push('null');
          } else {
            try {
              temp.push(JSON.stringify(arrv));
            } catch (e) {
              sdWarn('您的数据-', k, v, '数组里值有错误,已将其删除');
            }
          }
        });
        p[k] = temp;
      }

      var isIgnoreIllegal = _.indexOf(ignores || [], k) > -1;

      // 如果是多层结构对象，直接序列化为字符串. $option 不处理, 忽略非法的不处理。
      if (_.isObject(v) && k !== '$option' && !isIgnoreIllegal) {
        try {
          p[k] = JSON.stringify(v);
        } catch (e) {
          delete p[k];
          sdWarn('您的数据-', k, v, '数据值有错误，已将其删除');
        }
      }
      // 只能是字符串，数字，日期,布尔，数组，$option，或忽略非法。不满足则删除.
      else if (!(_.isString(v) || _.isNumber(v) || _.isDate(v) || _.isBoolean(v) || _.isArray(v) || _.isFunction(v) || k === '$option' || isIgnoreIllegal)) {
        sdWarn('您的数据-', k, v, '-格式不满足要求，我们已经将其删除');
        delete p[k];
      }
    });
    return p;
  }

  function formatString(str, maxLen) {
    if (_.isNumber(maxLen) && str.length > maxLen) {
      sdWarn('字符串长度超过限制，已经做截取--' + str);
      return str.slice(0, maxLen);
    } else {
      return str;
    }
  }

  function formatItem(data) {
    if ('item_type' in data) {
      var item_type = data['item_type'];

      var typeOnComplete = function (status) {
        if (!status) {
          delete data['item_type'];
        }
        return true;
      };

      _this.check({ item_type: item_type }, typeOnComplete);
    }
    if ('item_id' in data) {
      var item_id = data['item_id'];
      var idOnComplete = function (status, val, rule) {
        if (!status && rule === 'string') {
          delete data['item_id'];
        }
        return true;
      };
      _this.check({ item_id: item_id }, idOnComplete);
    }
  }
  function formatProperties(p, ignore) {
    _.each(p, function (val, key) {
      var onComplete = function (status, value, rule_type) {
        if (!status && rule_type !== 'keyLength') {
          delete p[key];
        }
        return true;
      };
      _.indexOf(ignore || [], key) === -1 && _this.check({ propertyKey: key }, onComplete);
    });
  }
  function searchZZAppStyle(data) {
    if (typeof data.properties.$project !== 'undefined') {
      data.project = data.properties.$project;
      delete data.properties.$project;
    }
    if (typeof data.properties.$token !== 'undefined') {
      data.token = data.properties.$token;
      delete data.properties.$token;
    }
  }

  function searchObjString(o) {
    var white_list = ['$element_selector', '$element_path'];
    var infinite_list = ['sensorsdata_app_visual_properties'];
    if (_.isObject(o)) {
      _.each(o, function (a, b) {
        if (_.isObject(a)) {
          searchObjString(o[b]);
        } else {
          if (_.isString(a)) {
            if (_.indexOf(infinite_list, b) > -1) {
              //大小不受限制，慎用
              return;
            }
            o[b] = formatString(a, _.indexOf(white_list, b) > -1 ? 1024 : _this.sd.para.max_string_length);
          }
        }
      });
    }
  }

  function filterReservedProperties(obj, ignore) {
    var reservedFields = ['distinct_id', 'user_id', 'id', 'date', 'datetime', 'event', 'events', 'first_id', 'original_id', 'device_id', 'properties', 'second_id', 'time', 'users'];
    if (!_.isObject(obj)) {
      return;
    }
    _.each(reservedFields, function (key, index) {
      if (!(key in obj)) {
        return;
      }

      if (_.indexOf(ignore || [], key) > -1) {
        return;
      }
      if (index < 3) {
        delete obj[key];
        sdWarn('您的属性- ' + key + '是保留字段，我们已经将其删除');
      } else {
        sdWarn('您的属性- ' + key + '是保留字段，请避免其作为属性名');
      }
    });
  }

  parseSuperProperties(data);
  // 时间格式转换
  this._.searchObjDate(data);

  if (_.isObject(p)) {
    // 过滤 properties 中不符合神策格式内容
    strip_sa_properties(p);

    // 过滤日志结构 properties 中的保留字段
    filterReservedProperties(p);

    // 兼容灼洲app端做的$project和$token而加的代码
    searchZZAppStyle(data);

    // 格式化 properties
    formatProperties(p);

    // 字符串长度截取
    searchObjString(p);
  } else if ('properties' in data) {
    // 在 properties 不为 JSON 时，将  data.properties 设置为 空JSON
    data.properties = {};
  }

  // setItem/deleteItem 格式化 item_type 及 item_id
  formatItem(data);
};

var emptyFn = {
  track: function () {},
  register: function () {},
  bind: function () {},
  unbind: function () {},
  sendEvent: function () {},
  setProfile: function () {},
  login: function () {}
};

var instance = new CustomDataBuilder();
export default createPlugin(instance, 'CustomDataBuilder', 'sdkAfterInitPara');
