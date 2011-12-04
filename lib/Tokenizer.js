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
	
	// =============== 将相邻两个词可以组成另一个词的合并起来 =============
	var tables = this.dict.tables;
	var i = 0;
	while (i < ret.length - 1) {
		var word1 = ret[i];
		var word2 = ret[i + 1];
		var nw = word1.w + word2.w;
		// 如果可以组成一个新词
		if (nw in tables) {
			ret.splice(i, 2, {
				w:	nw,
				f:	tables[nw].f,
				p:	tables[nw].p
			});
		}
		// 如果 是一个“小|老"后面跟一个未识别的单字，则认为是人名
		if ((word1.w == '小' || word1.w == '老') && word2.w.length == 1 && !word2.p) {
			ret.splice(i, 2, {
				w:	nw,
				p:	POSTAG.NR
			});
		}
		i++;
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
				f:	table[word].f,
				p:	table[word].p
			});
		}
	}
	
	// 如果没有匹配的词，则返回FALSE
	if (words.length < 1)
		return false;
	
	// ================= 取最有可能的词，规则：词性搭配优先、大长度优先， 出现频率高的优先 =======
	var NF = 2;	// 权重
	var maxf = words[0].f;
	var currw = words[0];
	var currwl = words[0].w.length;
	for (var i = 1, word; word = words[i]; i++) {
		// 如果当前词长度最大，如果词性相同则大长度优先，词性不同词频优先
		var swl = word.w.length - currwl;
		if (swl > 0) {
			// debug(word.w + '.' +(word.f << swl) + ' >= ' + currw.w + '.' + maxf);
			if (word.p[0] == currw.p[0] || (word.f << swl) >= maxf) {
				// 选择单词
				currw = word;
				currwl = word.w.length;
				maxf = word.f;
			}
		}
		// 如果当前词长度最小，则如果其频率大于当前词2倍，则现在当前词
		else if (word.f > maxf) {
			// 选择单词
			currw = word;
			currwl = word.w.length;
			maxf = word.f;
		}
	}
	// 调试：
	//if (words.length > 1)
	//	debug(words);
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
			// 判断 ChsName返回的名称的词性
			var nt = POSTAG.NR;
			if (chsname.names[block.w] < 1) // 专有名称
				nt = POSTAG.N;
			if (block.w.length <= 3 && block.w.substr(-1) == '家') // X家，代词
				nt = POSTAG.PRON;
			retb.push({
				w:	block.w,
				p:	nt
			});
			ret = ret.concat(retb);
		}
		// 如果不是以停止符合结尾的，则继续分析剩余部分
		if (lastcur < text.length) {
			var retb = this.splitByStopword(text.substr(lastcur, text.length - lastcur));
			ret = ret.concat(retb);
		}
	}
	
	// 对剩下未识别部分，继续匹配可能不带姓的名字
	var ret2 = [];
	for (var i = 0, word; word = ret[i]; i++) {
		var wt = word.w;
		if (word.p)
			ret2.push(word);
		else {
			var retb = chsname.matchNameOnly(wt);
			if (retb.length < 1)
				ret2.push(word);
			// 如果有匹配的人名，则将各个人名加入到结果列表中
			else {
				var lasti = 0;
				for (var bi = 0, b; b = retb[bi]; bi++) {
					if (b.c > lasti)
						ret2.push({w: wt.substr(lasti, b.c - lasti)});
					ret2.push({
						w:	wt.substr(b.c, b.w.length),
						p:	[POSTAG.NR]
					});
					lasti += b.w.length;
				}
				if (lasti < wt.length)
					ret2.push({w: wt.substr(lasti)});
			}
		}
	}
	
	return ret2;
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
	// ======================== 对未知词进行再次匹配 ======================
	for (var i = 0, word; word = ret[i]; i++) {
		if (word.p)
			ret2.push(word);
		else {
			// 分离里面的英文字母和数字
			var retb = splitEnWord(word.w);
			ret2 = ret2.concat(retb);
		}
	}
	ret = ret2;
	// ============================= 优化结果： 识别网址 ===================
	// http|https : / / POSTAG.DW|POSTAG.EN|POSTAG.NUM          ftp://    telnet://
	var surl = false;
	for (var i = 0; i < ret.length; i++) {
		var cp = ret[i].p[0];
		if (surl === false && cp == POSTAG.EN && ret[i + 1].w == ':' && ret[i + 2].w == '/' && ret[i + 3].w == '/') {
			surl = i;
			i += 3;
		}
		// 拼接网址
		else if (surl !== false && cp != POSTAG.EN && cp != POSTAG.NUM && ret[i].w.charCodeAt(0) < 128) {
			var len = i - surl;
			var url = '';
			var ui = surl;
			while (ui < i)
				url += ret[ui++].w;
			ret.splice(surl, len, {
				w:	url,
				p:	[POSTAG.URL]	// 网址类型
			});
			surl = false;
			i -= len;
		}
	}
	// 剩余部分拼接网址
	if (surl !== false) {
		var len = i - surl;
		var url = '';
		var ui = surl;
		while (ui < i)
			url += ret[ui++].w;
		ret.splice(surl, len, {
			w:	url,
			p:	[POSTAG.URL]		// 网址类型
		});
	}
	// =============================================
	return ret;
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