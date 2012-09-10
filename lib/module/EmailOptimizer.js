'use strict';

/**
 * 邮箱地址识别优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var debug = console.log; 
 
/** 模块类型 */
exports.type = 'optimizer';

/**
 * 模块初始化
 * 
 * @param {Segment} segment 分词接口
 */
exports.init = function (segment) {
  exports.segment = segment;
};

/**
 * 对可能是邮箱地址的单词进行优化
 *
 * @param {array} words 单词数组
 * @return {array}
 */
exports.doOptimize = function (words) {
  var POSTAG = exports.segment.POSTAG;
  //debug(words);
  
  var i = 0;
  var ie = words.length - 1;
  var addr_start = false;
  var has_at = false;
  while (i < ie) {
    var word = words[i];
    var is_ascii = ((word.p == POSTAG.A_NX) ||
            (word.p == POSTAG.A_M && word.w.charCodeAt(0) < 128))
            ? true : false;
    
    // 如果是外文字符或者数字，符合电子邮件地址开头的条件
    if (addr_start === false && is_ascii) {
      addr_start = i;
      i++;
      continue;
    } else {
      // 如果遇到@符号，符合第二个条件
      if (has_at === false && word.w == '@') {
        has_at = true;
        i++;
        continue;
      }
      // 如果已经遇到过@符号，且出现了其他字符，则截取邮箱地址
      if (has_at !== false && words[i - 1].w != '@' && is_ascii === false && !(word.w in EMAILCHAR)) {
        var mailws = words.slice(addr_start, i);
        //debug(toEmailAddress(mailws));
        words.splice(addr_start, mailws.length, {
          w:  toEmailAddress(mailws),
          p:  POSTAG.URL
        });
        i = addr_start + 1;
        ie -= mailws.length - 1;
        addr_start = false;
        has_at = false;
        continue;
      }
      // 如果已经开头
      if (addr_start !== false && (is_ascii || word.w in EMAILCHAR)) {
        i++;
        continue;
      }
    }
    
    // 移到下一个词
    addr_start = false;
    has_at = false;
    i++;
  }
  
  // 检查剩余部分
  if (has_at && words[ie]) {
    var word = words[ie];
    var is_ascii = ((word.p == POSTAG.A_NX) ||
            (word.p == POSTAG.A_M && word.w in EMAILCHAR))
            ? true : false;
    if (is_ascii) {
      var mailws = words.slice(addr_start, words.length);
      //debug(toEmailAddress(mailws));
      words.splice(addr_start, mailws.length, {
        w:  toEmailAddress(mailws),
        p:  POSTAG.URL
      });
    }
  }
  
  return words;
};

// ======================================================
// 邮箱地址中允许出现的字符
var _EMAILCHAR = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '!', '#', '$', '%', '&', '‘', '*', '+', '-', '.', '/', '=', '?', '^', '_', '|', '~'];
var EMAILCHAR = {};
for (var i in _EMAILCHAR) EMAILCHAR[_EMAILCHAR[i]] = 1;
  

/**
 * 根据一组单词生成邮箱地址
 *
 * @param {array} words 单词数组
 * @return {string}
 */
var toEmailAddress = function (words) {
  var ret = words[0].w;
  for (var i = 1, word; word = words[i]; i++) {
    ret += word.w;
  }
  return ret;
};
