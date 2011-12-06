/**
 * 字典识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
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
}

/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
exports.split = function (words) {
	var POSTAG = exports.segment.POSTAG;
	var TABLE = exports.segment.getDict('TABLE');
	var ret = [];
	for (var i = 0, word; word = words[i]; i++) {
		if (word.p > 0) {
			ret.push(word);
			continue;
		}
		// 仅对未识别的词进行匹配
		var wordinfo = matchWord(word.w);
		if (wordinfo.length < 1) {
			ret.push(word);
			continue;
		}
		// 分离出已识别的单词
		var lastc = 0;
		for (var ui = 0, bw; bw = wordinfo[ui]; ui++) {
			if (bw.c > lastc)
				ret.push({w: word.w.substr(lastc, bw.c - lastc)});
			ret.push({w: bw.w, p: TABLE[bw.w].p});
			lastc = bw.c + bw.w.length;
		}
		var lastword = wordinfo[wordinfo.length - 1];
		if (lastword.c + lastword.w.length < word.w.length)
			ret.push({w: word.w.substr(lastword.c + lastword.w.length)});
	}
	return ret;
}

// =================================================================
/**
 * 匹配单词，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
var matchWord = function (text, cur) {
	if (isNaN(cur))	cur = 0;
	var ret = [];
	var s = false;
	var TABLE = exports.segment.getDict('TABLE2');
	// 匹配可能出现的单词
	while (cur < text.length) {
		for (var i in TABLE) {
			var w = text.substr(cur, i);
			if (w in TABLE[i])
				ret.push({w: w, c: cur, f: TABLE[i][w].f});
		}
		cur++;
	}
	
	return filterWord(ret);
}
//debug(matchWord('长春市长春药店'));

/**
 * 选择最有可能匹配的单词
 *
 * @param {array} words 单词信息数组
 * @return {array}
 */
var filterWord = function (words) {
	// 将单词按位置分组
	var ret = [];
	var wordpos = {};
	for (var i = 0, word; word = words[i]; i++) {
		if (!wordpos[word.c])
			wordpos[word.c] = [];
		wordpos[word.c].push(word);
	}
	//debug(wordpos);
	
	// 选出最合适的单词
	var lastpos = 0;
	for (var i in wordpos) {
		if (i < lastpos)
			continue;
		/*
		 * 选取策略：  权值 = 当前词的频率 * 2^当前单词超出长度 * 下一个相邻的词组数量
		 */	
		var currword = wordpos[i][0];
		var rank = currword.f;
		var nextwords = wordpos[currword.c + currword.w.length];
		if (nextwords)
			rank = rank << (nextwords.length + 1);
		//debug(currword.w + ' f:' + currword.f + ' rank:' + rank);
		for (var j = 1, word; word = wordpos[i][j]; j++) {
			// 计算权值
			var diff = word.w.length - currword.w.length;
			var tmprank = word.f;
			// 长度差权值
			if (diff > 0)
				tmprank = tmprank << diff;
			// 下一个单词的权值和
			var nextwords = wordpos[word.c + word.w.length];
			if (nextwords)
				tmprank = tmprank << (nextwords.length + 1);
			
			// 选择权值最大的单词
			//debug(word.w + ' f:' + word.f + ' rank:' + tmprank + ' max-rank:' + rank);
			if (tmprank > rank) {
				currword = word;
				rank = currword.f;
			}
		}
		//debug('------------- ' + currword.w + ' rank:' + rank + '-------------------');
		lastpos = currword.c + currword.w.length;
		ret.push(currword);
	}
	
	//debug(ret);
	return ret;
}