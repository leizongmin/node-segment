/**
 * 分词器接口
 */
 
var WordDictionary = require('./WordDictionary');
var StopWord = require('./StopWord');
var Synonym = require('./Synonym');
var ChsName = require('./ChsName');
var Tokenizer = require('./Tokenizer');
var POSTAG = require('./POSTAG');
  
var debug = console.log;

 
/**
 * 创建分词器接口
*
* @param {object} options 选项，各种字典文件   dict, stopword, chsname, commonname
*/ 
var Segment = exports.Segment = function (options) {
	// 基本分析模块
	this.module = {
		dictionary:		new WordDictionary(),
		stopword:		new StopWord(),
		chsname:		new ChsName()
	}
	// 载入字典文件
	if (options.dict)
		if (options.dict instanceof Array)
			for (var i in options.dict)
				this.module.dictionary.load(options.dict[i]);
		else
			this.module.dictionary.load(options.dict);
	// 停止符号
	if (options.stopword)
		if (options.stopword instanceof Array)
			for (var i in options.stopword)
				this.module.stopword.load(options.stopword[i]);
		else
			this.module.stopword.load(options.stopword);
	// 载入中文名字
	if (options.chsname) {
		if (options.chsname[0] instanceof Array)
			for (var i in options.chsname[0])
				this.module.chsname.load(options.chsname[0][i], this.module.chsname.SINGLE_NAME);
		else
			this.module.chsname.load(options.chsname[0], this.module.chsname.SINGLE_NAME);
		if (options.chsname[1] instanceof Array)
			for (var i in options.chsname[1])
				this.module.chsname.load(options.chsname[1][i], this.module.chsname.DOUBLE_NAME_1);
		else
			this.module.chsname.load(options.chsname[1], this.module.chsname.DOUBLE_NAME_1);
		if (options.chsname[2] instanceof Array)
			for (var i in options.chsname[2])
				this.module.chsname.load(options.chsname[2][i], this.module.chsname.DOUBLE_NAME_2);
		else
			this.module.chsname.load(options.chsname[2], this.module.chsname.DOUBLE_NAME_2);
		if (options.chsname[3] instanceof Array)
			for (var i in options.chsname[3])
				this.module.chsname.load(options.chsname[3][i], this.module.chsname.COMMON_NAME_1);
		else
			this.module.chsname.load(options.chsname[3], this.module.chsname.COMMON_NAME_1);
	}
	// 载入常用名称
	if (options.commonname) {
		if (options.commonname instanceof Array)
			for (var i in options.commonname)
				this.module.chsname.load(options.commonname[i], this.module.chsname.COMMON_NAME_2);
		else
			this.module.chsname.load(options.commonname, this.module.chsname.COMMON_NAME_2);
	}
	// 创建初步分词器
	this.module.tokenizer = new Tokenizer(this.module.dictionary, this.module.stopword, this.module.chsname);
}

/**
 * 分词
 *
 * @param {string} text 要分词的文本
 * @return {array}
 */
Segment.prototype.doSegment = function (text) {
	return this.module.tokenizer.split(text);
}
