# 单页面下的页面路径
## 功能
给所有事件新增属性 spa_url_path（单页面下的页面路径）。
   
| 页面地址 | 得到的 spa_url_path |
| ------ | ------ |
| https://www.a.com/#abc	 | /#abc|
|https://www.a.com/page.html#abc |	/page.html#abc |
|https://www.a.com/page.html?abc#abc|/page.html|
|https://www.a.com/page.html#abc?abc|/page.html#abc|
    
原理：有 search 则取 pathname，没有 search 则取 pathname + hash的非 search 部分。  

## 集成
### ES Module 方式
```javascript
import urlpath from '/spa-url-path/index.es6';
var registerPlugin = sensors.use(urlpath);
```

## 改动
- 新增属性: 所有事件新增 spa_url_path。

## ⚠️ 注意
- 所有事件都会包含该属性
