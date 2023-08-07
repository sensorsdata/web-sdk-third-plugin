# 自定义组装上报插件
## 功能
自定义组装上报插件，允许自定义 distinct_id、server_url、send_type 拼装数据并上报到指定数据接收服务器。
## 集成

### ES Module 方式
```js
import sensors from 'sa-sdk-javascript'
import CustomDataBuilder from './index.es6.js'
 
// 创建自定义组装上报插件
var instance = sensors.use(CustomDataBuilder);
 
sensors.init(/** 初始化配置 **/);
```

## 插件 API 说明

### 创建实例
需要更换用户唯一 ID 且与当前采集的数据无任何关联，需要先通过 createInstance 创建新的实例
```js
var user = instance.createInstance(distinct_id[, is_login_id][, server_url][, send_type]);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   distinct_id   |  是   |  String  |  用户标识  |
|   is_login_id   |  否   |  Boolean  |  distinct_id （用户标识）是否为登录 ID。默认：false。true 为用户标识为登录 ID。  |
|   server_url   |  否   |  String  |  数据接收地址。   |
|   send_type   |  否   |  String  |  数据发生方式。默认：beacon。可选值：beacon / ajax / image  |

### 事件追踪
创建实例后，即可以通过 track() 方法追踪用户行为事件，并添加自定义属性：
```js
user.track(event_name[, properties]);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   event_name   |  是   |  String  |  自定义事件名称  |
|   properties   |  否   |  Object  |  自定义属性  |

### 用户登录
当发生登录或注册行为时，可以通过 login() 方法进行用户关联
```js
user.login(user_id);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   user_id   |  是   |  String  |  用户 ID  |

### 设置用户的属性
设置用户的属性，如果该属性已存在则覆盖。
```js
user.setProfile(properties);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   properties   |  是   |  Object  |  用户自定义属性  |

### 多用户 ID 关联
用于多个用户 ID 关联时调用，第一个参数从[详细的预置 id key 列表](https://manual.sensorsdata.cn/sa/latest/id-key-128058676.html)中获取，第二个参数为对应的关联用户 ID。
```js
user.bind(identities)
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   identities   |  是   |  Object  |  多个用户 ID key-value 对。最少需要两个 key-value 对。  |

### 多用户 ID 取消关联
用于多个用户 ID 取消关联时调用，第一个参数为取消关联的 key，第二个参数为对应的取消关联用户 ID。
```js
user.unbind(identity_key, identity_value);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   identity_key   |  是   |  String  |  取消关联的 key   |
|   identity_value   |  是   |  String  |  取消关联的 value  |

### 创建实例
如有其他类型的符合[神策数据格式](https://manual.sensorsdata.cn/sa/latest/tech_knowledge_layout-114000153.html)的数据，可以使用该方法自行设置并发送。
```js
user.sendEvent(data);
```
#### 配置参数
|  参数  |  必填  |  类型  |  备注  |
|  ----  | ----  |  ----  |  ----  |
|   data   |  是   |  String  |  用户标识  |
|   is_login_id   |  否   |  Boolean  |  自定义数据，可以设置所有符合[神策数据格式](https://manual.sensorsdata.cn/sa/latest/tech_knowledge_layout-114000153.html)的数据。  |
|   server_url   |  否   |  String  |  数据接收地址。   |
|   send_type   |  否   |  String  |  数据发生方式。默认：beacon。可选值：beacon / ajax / image  |

## 注意
* 该插件不做任何存储，如公共属性等需在调用 track 方法时手动传入。