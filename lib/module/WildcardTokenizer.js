'use strict';

/**
 * 通配符识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var debug = console.log; 
 
/** 模块类型 */
exports.type = 'tokenizer';

/**
 * 模块初始化
 * 
 * @param {Segment} segment 分词接口
 */
exports.init = function (segment) {
  exports.segment = segment;
};

/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
exports.split = function (words) {
  var POSTAG = exports.segment.POSTAG;
  var TABLE = exports.segment.getDict('WILDCARD');
  var ret = [];
  for (var i = 0, word; word = words[i]; i++) {
    if (word.p > 0) {
      ret.push(word);
      continue;
    }
    // 仅对未识别的词进行匹配
    var wordinfo = matchWord(word.w);
    if (wordinfo.length < 1) {
      ret.push(word);
      continue;
    }
    // 分离出已识别的单词
    var lastc = 0;
    for (var ui = 0, bw; bw = wordinfo[ui]; ui++) {
      if (bw.c > lastc) {
        ret.push({w: word.w.substr(lastc, bw.c - lastc)});
      }
      ret.push({w: bw.w, p: TABLE[bw.w.toLowerCase()].p});
      lastc = bw.c + bw.w.length;
    }
    var lastword = wordinfo[wordinfo.length - 1];
    if (lastword.c + lastword.w.length < word.w.length) {
      ret.push({w: word.w.substr(lastword.c + lastword.w.length)});
    }
  }
  return ret;
};

// =================================================================
/**
 * 匹配单词，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
var matchWord = function (text, cur) {
  if (isNaN(cur)) cur = 0;
  var ret = [];
  var s = false;
  var TABLE = exports.segment.getDict('WILDCARD2');
  // 匹配可能出现的单词，取长度最大的那个
  var lowertext = text.toLowerCase();
  while (cur < text.length) {
    var stopword = false;
    for (var i in TABLE) {
      if (lowertext.substr(cur, i) in TABLE[i]) {
        stopword = {w: text.substr(cur, i), c: cur};
      }
    }
    if (stopword !== false) {
      ret.push(stopword);
      cur += stopword.w.length;
    } else {
      cur++;
    }
  }
  return ret;
};
