'use strict';

/**
 * 词典优化模块
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
 * 词典优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
exports.doOptimize = function (words, is_not_first) {
  //debug(words);
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
    
    // ==========================================
    // 能组成一个新词的(词性必须相同)
    var nw = w1.w + w2.w;
    if (w1.p == w2.p && nw in TABLE) {
      words.splice(i, 2, {
        w:  nw,
        p:  TABLE[nw].p
      });
      ie--;
      continue;
    }
    
    // 形容词 + 助词 = 形容词，如： 不同 + 的 = 不同的
    if ((w1.p & POSTAG.D_A) > 0 && (w2.p & POSTAG.D_U)) {
      words.splice(i, 2, {
        w:  nw,
        p:  POSTAG.D_A
      });
      ie--;
      continue;
    }

    // ============================================
    // 数词组合
    if ((w1.p & POSTAG.A_M) > 0) {
      //debug(w2.w + ' ' + (w2.p & POSTAG.A_M));
      // 百分比数字 如 10%，或者下一个词也是数词，则合并
      if ((w2.p & POSTAG.A_M) > 0 || w2.w == '%') {
        words.splice(i, 2, {
          w:  w1.w + w2.w,
          p:  POSTAG.A_M
        });
        ie--;
        continue;
      }
      // 数词 + 量词，合并。如： 100个
      if ((w2.p & POSTAG.A_Q) > 0) {
        words.splice(i, 2, {
          w:  w1.w + w2.w,
          p:  POSTAG.D_MQ // 数量词
        });
        ie--;
        continue;
      }
      // 带小数点的数字 ，如 “3 . 14”，或者 “十五点三”
      // 数词 + "分之" + 数词，如“五十分之一”
      var w3 = words[i + 2];
      if (w3 && (w3.p & POSTAG.A_M) > 0 &&
         (w2.w == '.' || w2.w == '点' || w2.w == '分之')) {
        words.splice(i, 3, {
          w:  w1.w + w2.w + w3.w,
          p:  POSTAG.A_M
        });
        ie -= 2;
        continue;
      }
    }

    // 修正 “十五点五八”问题
    if ((w1.p & POSTAG.D_MQ) > 0 && w1.w.substr(-1) === '点' && w2.p & POSTAG.A_M) {
      //debug(w1, w2);
      var i2 = 2;
      var w4w = '';
      for (var j = i + i2; j < ie; j++) {
        var w3 = words[j];
        if ((w3.p & POSTAG.A_M) > 0) {
          w4w += w3.w;
          i2++;
        } else {
          break;
        }
      }
      words.splice(i, i2, {
        w:  w1.w + w2.w + w4w,
        p:  POSTAG.D_MQ // 数量词
      });
      ie -= i2 - 1;
      continue;
    }
    
    // 移到下一个词
    i++;
  }
  
  // 针对组合数字后无法识别新组合的数字问题，需要重新扫描一次
  return is_not_first === true ? words : exports.doOptimize(words, true);
};
