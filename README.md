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
segment.use('URLTokenizer');  // 载入识别模块，详见lib/module目录，或者是自定义模块的绝对路径
segment.loadDict('dict.txt'); // 载入字典，详见dicts目录，或者是自定义字典文件的绝对路径

// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```

授权
===============

基于MIT协议发布：

    Copyright (c) 2012 Lei Zongmin(雷宗民) <leizongmin@gmail.com>
    http://ucdok.com

    The MIT License

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
