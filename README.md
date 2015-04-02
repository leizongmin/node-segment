# 中文分词模块 [![Build Status](https://secure.travis-ci.org/leizongmin/node-segment.png?branch=master)](http://travis-ci.org/leizongmin/node-segment) [![Dependencies Status](https://david-dm.org/leizongmin/node-segment.png)](http://david-dm.org/leizongmin/node-segment)

![node-segment](https://nodei.co/npm/node-segment.png?downloads=true&stars=true)

本模块以**[盘古分词组件](http://pangusegment.codeplex.com/)**中的词库为基础，
算法设计也部分参考了盘古分词组件中的算法。

在线演示地址：<http://segment.ucdok.com/>

## 1、使用方法

```javascript
// 载入模块
var Segment = require('segment');
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();

// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```

返回结果格式：

```javascript
[ { w: '这是', p: 0 },
  { w: '一个', p: 2097152 },
  { w: '基于', p: 262144 },
  { w: 'Node.js', p: 8 },
  { w: '的', p: 8192 },
  { w: '中文', p: 1048576 },
  { w: '分词', p: 4096 },
  { w: '模块', p: 1048576 },
  { w: '。', p: 2048 } ]
```
其中 `w` 表示词的内容，`p` 表示词性（具体参考 https://github.com/leizongmin/node-segment/blob/master/lib/POSTAG.js 中的定义）


## 2、词典格式

词典文件为纯文本文件，每行定义一个词，格式为： `词|词性|词权值` ，如：`工信处|0x0020|100`

**词性** 的定义可参考文件 https://github.com/leizongmin/node-segment/blob/master/lib/POSTAG.js

**词权值** 越大表示词出现的频率越高

词典文件可参考：https://github.com/leizongmin/node-segment/tree/master/dicts


## 2、自定义识别模块

```javascript
// 载入模块
var Segment = require('segment');
// 创建实例
var segment = new Segment();
// 配置，可根据实际情况增删，详见segment.useDefault()方法
segment.use('URLTokenizer');  // 载入识别模块，详见lib/module目录，或者是自定义模块的绝对路径
segment.loadDict('dict.txt'); // 载入字典，详见dicts目录，或者是自定义字典文件的绝对路径

// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
```

自定义分词器：

```javascript
segment.use({

  // 类型
  type: 'tokenizer',

  // segment.use() 载入模块，初始化时执行
  init: function (segment) {
    // segment 为当前的Segment实例
  },

  // 分词
  split: function (words) {
    // words 为单词数组，如：['中文', '分词']
    // 返回一个新的数组用来替换旧的数组
    return words;
  }

});
```

自定义优化器：

```javascript
segment.use({

  // 类型
  type: 'optimizer',

  // segment.use() 载入模块，初始化时执行
  init: function (segment) {
    // segment 为当前的Segment实例
  },

  // 优化
  doOptimize: function (words) {
    // words 为分词结果的单词数组，如：[{w: '中文', p: 1048576}, {w: '分词', p: 4096}]
    // 返回一个新的数组用来替换旧的数组
    return words;
  }

})
```

分词器和优化器可参考默认模块：https://github.com/leizongmin/node-segment/tree/master/lib/module

其中 `*Tokenizer` 表示分词器， `*Optimizer` 表示优化器。


## 注意

**请勿用此模块来对较长且无任何标点符号的文本进行分词，否则会导致分词时间成倍增加。**


## MIT License

```
Copyright (c) 2012-2015 Zongmin Lei (雷宗民) <leizongmin@gmail.com>
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
```
