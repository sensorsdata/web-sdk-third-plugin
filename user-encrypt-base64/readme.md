# base64 用户信息加密
## 功能
该插件用来实现 base64 的用户加密的算法，通过实现 kit.userEncrypt、kit.userDecrypt、kit.userDecryptIfNeeded 完成。

## 集成
### ES Module 方式
```javascript
import base64 from '/dist/web/plugin/user-encrypt-base64/index.es6.js';
sensors.use(base64, {encrypt_cookie: true});
sensor.init({...});
```
### 初始化参数
初始化参数对象属性：
- `encrypt_cookie`：值 `true/false` ，表示是否进行加密。

## 注意
- 使用当前插件后，不能再在 `sensors.init` 中配置 `encrypt_cookie`，只能二选一。
- 当前是定制功能，一般情况下不建议使用。