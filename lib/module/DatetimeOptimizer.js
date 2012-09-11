'use strict';

/**
 * 日期时间优化模块
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
 * 日期时间优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
exports.doOptimize = function (words, is_not_first) {
  if (typeof is_not_first == 'undefined') {
    is_not_first = false;
  }
  // 合并相邻的能组成一个单词的两个词
  var TABLE = exports.segment.getDict('TABLE');
  var POSTAG = exports.segment.POSTAG;
  
  var i = 0;
  var ie = words.length - 1;
  while (i < ie) {
    var w1 = words[i];
    var w2 = words[i + 1];
    //debug(w1.w + ', ' + w2.w);
    
    if ((w1.p & POSTAG.A_M) > 0) {
      // =========================================
      // 日期时间组合   数字 + 日期单位，如 “2005年"
      if (w2.w in DATETIME) {
        var nw = w1.w + w2.w;
        var len = 2;
        // 继续搜索后面连续的日期时间描述，必须符合  数字 + 日期单位 
        while (true) {
          var w1 = words[i + len];
          var w2 = words[i + len + 1];
          if (w1 && w2 && (w1.p & POSTAG.A_M) > 0 && w2.w in DATETIME) {
            len += 2;
            nw += w1.w + w2.w;
          } else {
            break;
          }
        }
        words.splice(i, len, {
          w:  nw,
          p:  POSTAG.D_T
        });
        ie -= len - 1;
        continue;
      }
      // =========================================
    }
    
    // 移到下一个词
    i++;
  }
  
  return words;
};

// ====================================================
// 日期时间常见组合
var _DATETIME = [
  '世纪', '年', '年份', '年度', '月', '月份', '月度', '日', '号',
  '时', '点', '点钟', '分', '分钟', '秒', '毫秒'
];
var DATETIME = {};
for (var i in _DATETIME) DATETIME[_DATETIME[i]] = _DATETIME[i].length;
// ====================================================
