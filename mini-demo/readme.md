# demo 演示 helloworld
## 功能
发送 helloworld 事件

## 集成
### ES Module 方式
```javascript
import sensors form './dist/web/sensorsdata.es6';
import hw from '/mini-demo/index.es6';
sensors.use(hw);
```

## 改动
- 新增事件: 新增事件 hellworld。

## ⚠️ 注意
- 加载后立即触发事件
