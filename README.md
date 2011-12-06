# 中文分词模块

本模块以**[盘古分词组件](http://pangusegment.codeplex.com/)**中的词库为基础，
算法设计也部分参考了盘古分词组件中的算法。

在线演示地址：<http://segment.cnodejs.net/>

1、使用方法
========================

```javascript
	// 载入模块
	var Segment = require('node-segment').Segment;
	// 创建实例
	var segment = new Segment();
	// 使用默认的识别模块及字典
	segment.useDefault();
	// 开始分词
	console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```
