'use strict';

/**
 * 标点符号识别模块
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
    var stopinfo = matchStopword(word.w);
    if (stopinfo.length < 1) {
      ret.push(word);
      continue;
    }
    // 分离出标点符号
    var lastc = 0;
    for (var ui = 0, sw; sw = stopinfo[ui]; ui++) {
      if (sw.c > lastc) {
        ret.push({w: word.w.substr(lastc, sw.c - lastc)});
      }
      // 忽略空格
      if (sw.w != ' ') {
        ret.push({w: sw.w, p: POSTAG.D_W});
      }
      lastc = sw.c + sw.w.length;
    }
    var lastsw = stopinfo[stopinfo.length - 1];
    if (lastsw.c + lastsw.w.length < word.w.length) {
      ret.push({w: word.w.substr(lastsw.c + lastsw.w.length)});
    }
  }
  return ret;
};

// =================================================================
// 标点符号
var _STOPWORD = ' ,.;+-|/\\\'":?<>[]{}=!@#$%^&*()~`' +
                '。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦' +
                '﹤‐￣¯―﹨ˆ˜﹍﹎+=<­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸' +
                '﹀︺︾ˉ﹂﹄︼＋－×÷﹢﹣±／＝≈≡≠∧∨∑∏∪∩∈⊙⌒⊥∥∠∽≌＜＞≤≥≮≯∧∨√﹙﹚[]﹛﹜∫∮∝∞⊙∏' +
                '┌┬┐┏┳┓╒╤╕─│├┼┤┣╋┫╞╪╡━┃└┴┘┗┻┛╘╧╛┄┆┅┇╭─╮┏━┓╔╦╗┈┊│╳│┃┃╠╬╣┉┋╰─╯┗━┛' +
                '╚╩╝╲╱┞┟┠┡┢┦┧┨┩┪╉╊┭┮┯┰┱┲┵┶┷┸╇╈┹┺┽┾┿╀╁╂╃╄╅╆' +
                '○◇□△▽☆●◆■▲▼★♠♥♦♣☼☺◘♀√☻◙♂×▁▂▃▄▅▆▇█⊙◎۞卍卐╱╲▁▏↖↗↑←↔◤◥╲╱▔▕↙↘↓→↕◣◢∷▒░℡™';
_STOPWORD = _STOPWORD.split('');
var STOPWORD = {};
var STOPWORD2 = {};
for (var i in _STOPWORD) {
  if (_STOPWORD[i] == '') continue;
  var len = _STOPWORD[i].length;
  STOPWORD[_STOPWORD[i]] = len;
  if (!STOPWORD2[len]) STOPWORD2[len] = {};
  STOPWORD2[len][_STOPWORD[i]] = len;
};
// debug(STOPWORD2);
// =================================================================

/**
 * 匹配包含的标点符号，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
var matchStopword = function (text, cur) {
  if (isNaN(cur)) cur = 0;
  var ret = [];
  var isMatch = false;
  while (cur < text.length) {
    for (var i in STOPWORD2) {
      var w = text.substr(cur, i);
      if (w in STOPWORD2[i]) {
        ret.push({w: w, c: cur});
        isMatch = true;
        break;
      }
    }
    cur += isMatch === false ? 1 : w.length;
    isMatch = false;
  }
  
  return ret;
};
