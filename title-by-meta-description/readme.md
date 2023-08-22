# 使用 meta 中的 description 作为 title 值
## 功能
该插件使用 &lt;meta name="description" content="标题11"/&gt; 这个标签中的 content 值替换&lt;title&gt;的值 作为 $title 的取值。

## 集成
### ES Module 方式
```javascript
import sensors from '...';
import metaTitle from 'index.es6.js';
sensors.use(metaTitle);
sensors.init(...);
sensors.quick('autoTrack');
```

### Script 方式
```javascript
<script src="...sensorsdata.min.js"></script>
<script src="...index.closure.js"></script>
var sensors = sensorsDataAnalytic201505;
sensors.use(getTitleByDescriptionMeta);
sensors.init(...);
sensors.quick('autoTrack');
```
