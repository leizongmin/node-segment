'use strict';

/**
 * 外文字符、数字识别模块
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
  var ret = [];
  for (var i = 0, word; word = words[i]; i++) {
    if (word.p) {
      ret.push(word);
    } else {
      // 仅对未识别的词进行匹配
      ret = ret.concat(splitForeign(word.w));
    }
  }
  return ret;
};

// =================================================================
/**
 * 匹配包含的英文字符和数字，并分割
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
var splitForeign = function (text, cur) {
  var POSTAG = exports.segment.POSTAG;
  if (isNaN(cur)) cur = 0;
  var ret = [];
  
  // 取第一个字符的ASCII码
  var lastcur = 0;
  var lasttype = 0;
  var c = text.charCodeAt(0);
  // 全角数字或字母
  if (c >= 65296 && c <= 65370) c -= 65248;
  // 数字  lasttype = POSTAG.A_M
  if (c >= 48 && c <= 57) lasttype = POSTAG.A_M;
  // 字母 lasttype = POSTAG.A_NX
  else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) lasttype = POSTAG.A_NX;
  else lasttype = POSTAG.UNK;
  
  for (var i = 1; i < text.length; i++) {
    var c = text.charCodeAt(i);
    // 全角数字或字母
    if (c >= 65296 && c <= 65370) c -= 65248;
    // 数字  lasttype = POSTAG.A_M
    if (c >= 48 && c <= 57) {
      if (lasttype !== POSTAG.A_M) {
        var nw = {w: text.substr(lastcur, i - lastcur)};
        if (lasttype !== POSTAG.UNK) nw.p = lasttype;
        ret.push(nw);
        lastcur = i;
      }
      lasttype = POSTAG.A_M;
    } else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
      // 字母 lasttype = POSTAG.A_NX
      if (lasttype !== POSTAG.A_NX) {
        var nw = {w: text.substr(lastcur, i - lastcur)};
        if (lasttype !== POSTAG.UNK) nw.p = lasttype;
        ret.push(nw);
        lastcur = i;
      }
      lasttype = POSTAG.A_NX;
    } else {
      // 其他
      if (lasttype !== POSTAG.UNK) {
        ret.push({
          w:  text.substr(lastcur, i - lastcur),
          p:  [lasttype]
        });
        lastcur = i;
      }
      lasttype = POSTAG.UNK;
    }
  }
  // 剩余部分
  var nw = {w: text.substr(lastcur, i - lastcur)};
  if (lasttype !== POSTAG.UNK) nw.p = lasttype;
  ret.push(nw);
  
  // debug(ret);
  return ret;
};
//debug(splitForeign('ad222经济核算123非'));
