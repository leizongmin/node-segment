'use strict';

/**
 * URL识别模块
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
    if (word.p > 0) {
      ret.push(word);
      continue;
    }
    // 仅对未识别的词进行匹配
    var urlinfo = matchURL(word.w);
    if (urlinfo.length < 1) {
      ret.push(word);
      continue;
    }
    // 分离出URL
    var lastc = 0;
    for (var ui = 0, url; url = urlinfo[ui]; ui++) {
      if (url.c > lastc) {
        ret.push({w: word.w.substr(lastc, url.c - lastc)});
      }
      ret.push({w: url.w, p: POSTAG.URL});
      lastc = url.c + url.w.length;
    }
    var lasturl = urlinfo[urlinfo.length - 1];
    if (lasturl.c + lasturl.w.length < word.w.length) {
      ret.push({w: word.w.substr(lasturl.c + lasturl.w.length)});
    }
  }
  // debug(ret);
  return ret;
};

// =================================================================
// 协议URL头
var PROTOTAL = ['http://', 'https://', 'ftp://', 'news://', 'telnet://'];
// 协议头最小长度
var MIN_PROTOTAL_LEN = 100;
for (var i in PROTOTAL) {
  if (PROTOTAL[i].length < MIN_PROTOTAL_LEN) {
    MIN_PROTOTAL_LEN = PROTOTAL[i].length;
  }
}
// 允许出现在URL中的字符
var _URLCHAR = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '!', '#', '$', '%', '&', '‘', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '=', '?', '@', '[', '\\', ']', '^', '_', '`', '|', '~'];
var URLCHAR = {};
for (var i in _URLCHAR) {
  URLCHAR[_URLCHAR[i]] = 1;
}
// =================================================================

/**
 * 匹配包含的网址，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
var matchURL = function (text, cur) {
  if (isNaN(cur)) cur = 0;
  var ret = [];
  var s = false;
  while (cur < text.length) {
    // 判断是否为 http:// 之类的文本开头
    if (s === false && cur < text.length - MIN_PROTOTAL_LEN) {
      for (var i = 0, prot; prot = PROTOTAL[i]; i++) {
        if (text.substr(cur, prot.length) == prot) {
          s = cur;
          cur += prot.length - 1;
          break;
        }
      }
    } else if (s !== false && !(text.charAt(cur) in URLCHAR)) {
      // 如果以http://之类开头，遇到了非URL字符，则结束
      ret.push({
        w:  text.substr(s, cur - s),
        c:  s
      });
      s = false;
    }
    cur++;
  }
  // 检查剩余部分
  if (s !== false) {
    ret.push({
      w:  text.substr(s, cur - s),
      c:  s
    });
  }
  
  return ret;
};
// debug(matchURL('http://www.baidu.com哈啊http://哇fdgggghttp://baidu.com/ss/'));
