'use strict';

/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var POSTAG = require('./POSTAG');
var Tokenizer = require('./Tokenizer');
var Optimizer = require('./Optimizer');

var debug = console.log;


/**
 * 创建分词器接口
*/
var Segment = module.exports = function () {
  this.POSTAG = POSTAG; // 词性
  this.DICT = {};       // 词典表
  this.modules = {
    tokenizer:  [],     // 分词模块
    optimizer:  []      // 优化模块
  };
  this.tokenizer = new Tokenizer(this);
  this.optimizer = new Optimizer(this);
};

/**
 * 载入分词模块
 *
 * @param {String|Array|Object} module 模块名称(数组)或模块对象
 * @return {Segment}
 */
Segment.prototype.use = function (module) {
  var me = this;

  if (Array.isArray(module)) {
    module.forEach(function (module) {
      me.use(module[i]);
    });

  } else {
    if (typeof module == 'string') {
      var filename = path.resolve(__dirname, 'module', module + '.js');
      if (!fs.existsSync(filename)) {
        throw Error('Cannot find module "' + module + '".');
      } else {
        module = require(filename);
      }
    }
    // 初始化并注册模块
    module.init(this);
    this.modules[module.type].push(module);
  }

  return this;
};

Segment.prototype._resolveDictFilename = function (name) {
  var filename = path.resolve(name);
  if (!fs.existsSync(filename)) {
    var filename = path.resolve(__dirname, '../dicts', name);
    if (!fs.existsSync(filename)) {
      throw Error('Cannot find dict file "' + filename + '".');
    }
  }
  return filename;
};

/**
 * 载入字典文件
 *
 * @param {String} name 字典文件名
 * @param {String} type 类型
 * @param {Boolean} convert_to_lower 是否全部转换为小写
 * @return {Segment}
 */
Segment.prototype.loadDict = function (name, type, convert_to_lower) {
  var filename = this._resolveDictFilename(name);
  if (!type)  type = 'TABLE';     // 默认为TABLE

  // 初始化词典
  if (!this.DICT[type]) this.DICT[type] = {};
  if (!this.DICT[type + '2']) this.DICT[type + '2'] = {};
  var TABLE = this.DICT[type];        // 词典表  '词' => {属性}
  var TABLE2 = this.DICT[type + '2']; // 词典表  '长度' => '词' => 属性
  // 导入数据
  var POSTAG = this.POSTAG;
  var data = fs.readFileSync(filename, 'utf8');
  if (convert_to_lower) data = data.toLowerCase();

  data.split(/\r?\n/).forEach(function (line) {
    var blocks = line.split('|');
    if (blocks.length > 2) {
      var w = blocks[0].trim();
      var p = Number(blocks[1]);
      var f = Number(blocks[2]);

      // 一定要检查单词是否为空，如果为空会导致Bug
      if (w.length > 0) {
        TABLE[w] = {f: f, p: p};
        if (!TABLE2[w.length]) TABLE2[w.length] = {};
        TABLE2[w.length][w] = TABLE[w];
      }
    }
  });

  return this;
};

/**
 * 取词典表
 *
 * @param {String} type 类型
 * @return {object}
 */
Segment.prototype.getDict = function (type) {
  return this.DICT[type];
};

/**
 * 载入同义词词典
 *
 * @param {String} name 字典文件名
 */
Segment.prototype.loadSynonymDict = function (name) {
  var filename = this._resolveDictFilename(name);
  var type = 'SYNONYM';

  // 初始化词典
  if (!this.DICT[type]) this.DICT[type] = {};
  var TABLE = this.DICT[type];        // 词典表  '同义词' => '标准词'
  // 导入数据
  var data = fs.readFileSync(filename, 'utf8');

  data.split(/\r?\n/).forEach(function (line) {
    var blocks = line.split(',');
    if (blocks.length > 1) {
      var n1 = blocks[0].trim();
      var n2 = blocks[1].trim();
      TABLE[n1] = n2;
      if (TABLE[n2] === n1) {
        delete TABLE[n2];
      }
    }
  });

  return this;
};

/**
 * 载入停止符词典
 *
 * @param {String} name 字典文件名
 */
Segment.prototype.loadStopwordDict = function (name) {
  var filename = this._resolveDictFilename(name);
  var type = 'STOPWORD';

  // 初始化词典
  if (!this.DICT[type]) this.DICT[type] = {};
  var TABLE = this.DICT[type];        // 词典表  '同义词' => '标准词'
  // 导入数据
  var data = fs.readFileSync(filename, 'utf8');

  data.split(/\r?\n/).forEach(function (line) {
    line = line.trim();
    if (line) {
      TABLE[line] = true;
    }
  });

  return this;
};

/**
 * 使用默认的识别模块和字典文件
 *
 * @return {Segment}
 */
Segment.prototype.useDefault = function () {
  this
    // 识别模块
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
    .loadDict('dict3.txt')          // 扩展词典（用于调整原盘古词典）
    .loadDict('names.txt')          // 常见名词、人名
    .loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符
    .loadSynonymDict('synonym.txt')   // 同义词
    .loadStopwordDict('stopword.txt') // 停止符
  ;
  return this;
};

/**
 * 开始分词
 *
 * @param {String} text 文本
 * @param {Object} options 选项
 *   - {Boolean} simple 是否仅返回单词内容
 *   - {Boolean} stripPunctuation 去除标点符号
 *   - {Boolean} convertSynonym 转换同义词
 *   - {Boolean} stripStopword 去除停止符
 * @return {Array}
 */
Segment.prototype.doSegment = function (text, options) {
  var me = this;
  options = options || {};
  var ret = [];

  // 将文本按照换行符分割成多段，并逐一分词
  text.replace(/\r/g, '\n').split(/(\n|\s)+/).forEach(function (section) {
    var section = section.trim();
    if (section.length < 1) return;
    // ======================================
    // 分词
    var sret = me.tokenizer.split(section, me.modules.tokenizer);

    // 优化
    sret = me.optimizer.doOptimize(sret, me.modules.optimizer);

    // ======================================
    // 连接分词结果
    if (sret.length > 0) ret = ret.concat(sret);
  });

  // 去除标点符号
  if (options.stripPunctuation) {
    ret = ret.filter(function (item) {
      return item.p !== POSTAG.D_W;
    });
  }

  // 转换同义词
  function convertSynonym (list) {
    var count = 0;
    var TABLE = me.getDict('SYNONYM');
    list = list.map(function (item) {
      if (item.w in TABLE) {
        count++;
        return {w: TABLE[item.w], p: item.p};
      } else {
        return item;
      }
    });
    return {count: count, list: list};
  }
  if (options.convertSynonym) {
    do {
      var result = convertSynonym(ret);
      ret = result.list;
    } while (result.count > 0);
  }

  // 去除停止符
  if (options.stripStopword) {
    var STOPWORD = me.getDict('STOPWORD');
    ret = ret.filter(function (item) {
      return !(item.w in STOPWORD);
    });
  }

  // 仅返回单词内容
  if (options.simple) {
    ret = ret.map(function (item) {
      return item.w;
    });
  }

  return ret;
};

/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
Segment.prototype.toString= function (words) {
  return words.map(function (item) {
    return item.w;
  }).join('');
};

/**
 * 根据某个单词或词性来分割单词数组
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 用于分割的单词或词性
 * @return {Array}
 */
Segment.prototype.split = function (words, s) {
  var ret = [];
  var lasti = 0;
  var i = 0;
  var f = typeof s === 'string' ? 'w' : 'p';

  while (i < words.length) {
    if (words[i][f] == s) {
      if (lasti < i) ret.push(words.slice(lasti, i));
      ret.push(words.slice(i, i + 1));
      i++;
      lasti = i;
    } else {
      i++;
    }
  }
  if (lasti < words.length - 1) {
    ret.push(words.slice(lasti, words.length));
  }

  return ret;
};

/**
 * 在单词数组中查找某一个单词或词性所在的位置
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 要查找的单词或词性
 * @param {Number} cur 开始位置
 * @return {Number} 找不到，返回-1
 */
Segment.prototype.indexOf = function (words, s, cur) {
  cur = isNaN(cur) ? 0 : cur;
  var f = typeof s === 'string' ? 'w' : 'p';

  while (cur < words.length) {
    if (words[cur][f] == s) return cur;
    cur++;
  }

  return -1;
};
