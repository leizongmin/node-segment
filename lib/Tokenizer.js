/**
 * 初步分词器
 *
 * 分词顺序：   常用名称、人名  ==> 标点符号  ==> 词典 ==> 数字、英文字符
 */
 
var POSTAG = require('./POSTAG'); 
var debug = console.log;
 
/**
 * 创建分词器
 *
 * @param {WordDictionary} dict 词典
 * @param {Stopword} stopword 停止符
 * @param {ChsName} chsname 中文名分析器
 */ 
var Tokenizer = module.exports = function (dict, stopword, chsname) {
	this.dict = dict;
	this.stopword = stopword;
	this.chsname = chsname;
}

/**
 * 分词（仅根据字典进行分词）
 *
 * @param {string} text 要分词的文本
 */
Tokenizer.prototype.splitByDict = function (text) {
	text = text.trim();
	var ret = [];
	
	// 匹配在一定范围内出现在字典中的词，并取出最有可能的词
	var cur = 0;
	var nflag = false;
	var ncur = 0;
	while (cur < text.length) {
		var word = this.next(text, cur);
		// 如果找不到匹配的词，则将指针移到下一个位置，直到匹配出下一个词时，将中间部分作为未知词看待
		if (word === false) {
			if (!nflag) {
				nflag = true;
				ncur = cur;
			}
			cur++;
		}
		// 如果找到匹配的词，则添加到列表中
		else {
			if (nflag) {
				ret.push({
					w:	text.substr(ncur, cur - ncur)		// 未识别的词
				});
				nflag = false;
			}
			ret.push(word);
			cur += word.w.length;
		}
	}
	// 将剩下的文本作为未知词添加到列表
	if (nflag) {
		ret.push({
			w:	text.substr(ncur, cur - ncur)
		});
	}
	return ret;
}

/**
 * 根据字典匹配一个最有可能的词
 *
 * @param {string} text 字符串
 * @param {int} cur 开始位置
 * @param {bool} is_test 是否为测试
 * @return {object}
 */
Tokenizer.prototype.next = function (text, cur, is_test) {
	// 获取所有匹配的词
	var tables2 = this.dict.tables2;
	var words = [];
	for (var i in tables2) {
		var table = tables2[i];
		var word = text.substr(cur, i);
		if (word in table) {
			words.push({
				w:	word,
				f:		table[word].f,
				p:		table[word].p
			});
		}
	}
	
	// 如果没有匹配的词，则返回FALSE
	if (words.length < 1)
		return false;
	
	// 取最有可能的词，规则：词性搭配优先、大长度优先， 出现频率高的优先
	var maxf = words[0].f;
	var currw = words[0];
	var currwl = words[0].w.length;
	for (var i = 1, word; word = words[i]; i++) {
		if (word.w.length >= currwl || word.f > maxf) {
			currw = word;
			currwl = word.w.length;
		}
	}
	return currw;
}

/**
 * 匹配标点符号，将文本分割成多段并分词
 *
 * @param {string} text 要分词的文本
 * @return {array}
 */
Tokenizer.prototype.splitByStopword = function (text) {
	var ret = [];
	var blocks = this.stopword.split(text, 0);
	if (blocks.length < 1) {
		ret = this.splitByDict(text);
	}
	else {
		// 将文本分多块分词，对每一块进行分词，再连接起来
		var lastcur = 0;
		for (var i = 0, block; block = blocks[i]; i++) {
			var retb = this.splitByDict(text.substr(lastcur, block.c - lastcur));
			lastcur = block.c + block.w.length;
			retb.push({w: block.w, p: [POSTAG.DW]});	// 标点符号
			ret = ret.concat(retb);
		}
		// 如果不是以停止符合结尾的，则继续分析剩余部分
		if (lastcur < text.length) {
			var retb = this.splitByDict(text.substr(lastcur, text.length - lastcur));
			ret = ret.concat(retb);
		}
	}
	return ret;
}

/**
 * 匹配中文人名，将文本分割成多段并分词
 *
 * @param {string} text 要分词的文本
 * @return {array}
 */
Tokenizer.prototype.splitByChsName = function (text) {
	var chsname = this.chsname;
	var ret = [];
	var blocks = chsname.match(text);
	if (blocks.length < 1) {
		ret = this.splitByStopword(text);
	}
	else {
		// 将文本分多块分词，对每一块进行分词，再连接起来
		var lastcur = 0;
		for (var i = 0, block; block = blocks[i]; i++) {
			var retb = this.splitByStopword(text.substr(lastcur, block.c - lastcur));
			lastcur = block.c + block.w.length;
			retb.push({
				w:	block.w,
				p:	[(chsname.names[block.w] < 1 ? POSTAG.N : POSTAG.NR)]	// 其他名称或人名
			});
			ret = ret.concat(retb);
		}
		// 如果不是以停止符合结尾的，则继续分析剩余部分
		if (lastcur < text.length) {
			var retb = this.splitByStopword(text.substr(lastcur, text.length - lastcur));
			ret = ret.concat(retb);
		}
	}
	return ret;
}

/**
 * 分词
 *
 * @param {string} text 要分词的文本
 * @param {array} 
 */
Tokenizer.prototype.split = function (text) {
	var ret = this.splitByChsName(text);
	var ret2 = [];
	// 对未知词进行再次匹配
	for (var i = 0, word; word = ret[i]; i++) {
		if (word.p) {
			ret2.push(word);
		}
		else {
			var retb = splitEnWord(word.w);
			ret2 = ret2.concat(retb);
		}
	}
	// 优化结果： 对数字后面可能出现单位词的，将其合并,如：2005年，15斤
	
	return ret2;
}

/**
 * 从文本中提取出数字或字母组成的单词
 *
 * @param {string} text 要分词的文本
 * @param {array}
 */
var splitEnWord = function (text) {
	var ret = [];
	var lastcur = 0;
	var lasttype = 0;
	var c = text.charCodeAt(0);
	// 全角数字或字母
	if (c >= 65296 && c <= 65370)
		c -= 65248;
	// 数字  lasttype = POSTAG.NUM
	if (c >= 48 && c <= 57)
		lasttype = POSTAG.NUM;
	// 字母 lasttype = POSTAG.EN
	else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
		lasttype = POSTAG.EN;
	else
		lasttype = POSTAG.UNK;
	
	for (var i = 1; i < text.length; i++) {
		var c = text.charCodeAt(i);
		// 全角数字或字母
		if (c >= 65296 && c <= 65370)
			c -= 65248;
		// 数字  lasttype = POSTAG.NUM
		if (c >= 48 && c <= 57) {
			if (lasttype != POSTAG.NUM) {
				ret.push({
					w:	text.substr(lastcur, i - lastcur),
					p:	[lasttype]
				});
				lastcur = i;
			}
			lasttype = POSTAG.NUM;
		}
		// 字母 lasttype = POSTAG.EN
		else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
			if (lasttype != POSTAG.EN) {
				ret.push({
					w:	text.substr(lastcur, i - lastcur),
					p:	[lasttype]
				});
				lastcur = i;
			}
			lasttype = POSTAG.EN;
		}
		// 其他
		else {
			if (lasttype != POSTAG.UNK) {
				ret.push({
					w:	text.substr(lastcur, i - lastcur),
					p:	[lasttype]
				});
				lastcur = i;
			}
			lasttype = POSTAG.UNK;
		}
	}
	// 剩余部分
	ret.push({
		w:	text.substr(lastcur, i - lastcur),
		p:	[lasttype]
	});
	
	return ret;
}