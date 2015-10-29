# 中文分词模块 [![Build Status](https://secure.travis-ci.org/leizongmin/node-segment.png?branch=master)](http://travis-ci.org/leizongmin/node-segment) [![Dependencies Status](https://david-dm.org/leizongmin/node-segment.png)](http://david-dm.org/leizongmin/node-segment)

![node-segment](https://nodei.co/npm/node-segment.png?downloads=true&stars=true)

本模块以**[盘古分词组件](http://pangusegment.codeplex.com/)**中的词库为基础，
算法设计也部分参考了盘古分词组件中的算法。

在线演示地址：<http://segment.ucdok.com/>

本分词模块具有以下特点：

+ 纯JavaScript编写，可以在任何支持ECMAScript5的引擎上执行（需要稍微修改部分代码）
+ 基于词性进行联想识别
+ 可使用JavaScript编写自定义的分词模块


## 1、使用方法

安装：

```bash
$ npm install segment --save
```

使用方法：

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

### 不返回词性

```javascript
var text = '这是一个基于Node.js的中文分词模块。';
var result = segment.doSegment(text, {
  simple: true
});
console.log(result);
```

结果：

```javascript
[ '这是', '一个', '基于', 'Node.js', '的', '中文', '分词', '模块', '。' ]
```

### 去除标点符号

```javascript
var text = '这是一个基于Node.js的中文分词模块。';
var result = segment.doSegment(text, {
  stripPunctuation: true
});
console.log(result);
```

结果：

```javascript
[ { w: '这是', p: 0 },
  { w: '一个', p: 2097152 },
  { w: '基于', p: 262144 },
  { w: 'Node.js', p: 8 },
  { w: '的', p: 8192 },
  { w: '中文', p: 1048576 },
  { w: '分词', p: 4096 },
  { w: '模块', p: 1048576 } ]
```

### 转换同义词

载入同义词词典：

```javascript
segment.loadSynonymDict('synonym.txt');
```

词典格式：

```
什么时候,何时
入眠,入睡
```

在分词时设置`convertSynonym=true`则结果中的`"什么时候"`将被转换为`"何时"`，`"入眠"`将被转换为`"入睡"`：

```javascript
var text = '什么时候我也开始夜夜无法入睡';
var result = segment.doSegment(text, {
  convertSynonym: true
});
console.log(result);
```

结果：

```javascript
[ { w: '何时', p: 0 },
  { w: '我', p: 65536 },
  { w: '也', p: 134217728 },
  { w: '开始', p: 4096 },
  { w: '夜夜', p: 131072 },
  { w: '无法', p: 134217728 },
  { w: '入睡', p: 4096 } ]
```

### 去除停止符

载入词典：

```javascript
segment.loadStopwordDict('stopword.txt');
```

词典格式：

```
之所以
因为
```

在分词时设置`stripStopword=true`则结果中的`"之所以"`和`"因为"`将被去除：

```javascript
var text = '之所以要编写一个纯JS的分词器是因为当时没有一个简单易用的Node.js模块';
var result = segment.doSegment(text, {
  stripStopword: true
});
console.log(result);
```

结果：

```javascript
[ { w: '编写', p: 4096 },
  { w: '纯', p: 1073741824 },
  { w: 'JS', p: [ 16 ] },
  { w: '分词', p: 4096 },
  { w: '器' },
  { w: '当时', p: 16384 },
  { w: '没有', p: 4096 },
  { w: '简单', p: 1073741824 },
  { w: '易用' },
  { w: 'Node.js', p: 8 },
  { w: '模块', p: 1048576 } ]
```


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

一般可通过 `segment.useDefault()` 来载入默认的配置，若要自定义加载，可参考 `useDefault()` 的代码：

```javascript
segment
  // 分词模块
  // 强制分割类单词识别
  .use('URLTokenizer')            // URL识别
  .use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
  .use('PunctuationTokenizer')    // 标点符号识别
  .use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
  // 中文单词识别
  .use('DictTokenizer')           // 词典识别
  .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

  // 优化模块
  .use('EmailOptimizer')          // 邮箱地址识别
  .use('ChsNameOptimizer')        // 人名识别优化
  .use('DictOptimizer')           // 词典识别优化
  .use('DatetimeOptimizer')       // 日期时间识别优化

  // 字典文件
  .loadDict('dict.txt')           // 盘古词典
  .loadDict('dict2.txt')          // 扩展词典（用于调整原盘古词典）
  .loadDict('names.txt')          // 常见名词、人名
  .loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符
  .loadSynonymDict('synonym.txt')   // 同义词
  .loadStopwordDict('stopword.txt') // 停止符
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
