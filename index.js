'use strict';

/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
// 分词接口 
exports.Segment = require('./lib/Segment');

// 词性接口
exports.POSTAG = require('./lib/POSTAG');

// 版本
exports.version = require('./package.json').version;

/*
使用示例：

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefault();
// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));

*/