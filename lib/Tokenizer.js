'use strict';

/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
/**
 * 分词模块管理器
*
* @param {Segment} 分词接口
*/ 
var Tokenizer = module.exports = function (segment) {
  this.segment = segment;
};

/**
 * 对一段文本进行分词
 *
 * @param {string} text 文本
 * @param {array} modules 分词模块数组
 * @return {array}
 */
Tokenizer.prototype.split = function (text, modules) {
  if (modules.length < 1) {
    throw Error('No tokenizer module!');
  } else {
    // 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
    var ret = [{w: text}];
    for (var i = 0, module; module = modules[i]; i++) {
      ret = module.split(ret);
    }
    return ret;
  }
};
