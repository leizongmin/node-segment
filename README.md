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
	// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
	segment.useDefault();
	
	// 开始分词
	console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```

2、自定义识别
=====================

```javascript
	// 载入模块
	var Segment = require('node-segment').Segment;
	// 创建实例
	var segment = new Segment();
	// 配置，可根据实际情况增删，详见segment.useDefault()方法
	segment.use('URLTokenizer'); 	// 载入识别模块，详见lib/module目录
	segment.loadDict('dict.txt');	// 载入字典，详见dicts目录，或者是自定义字典文件的绝对路径
	
	// 开始分词
	console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```
