/**
 * 词典优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
 
var FAMILY_NAME_1 = require('./CHS_NAMES').FAMILY_NAME_1; 
var FAMILY_NAME_2 = require('./CHS_NAMES').FAMILY_NAME_2; 
var SINGLE_NAME = require('./CHS_NAMES').SINGLE_NAME;
var DOUBLE_NAME_1 = require('./CHS_NAMES').DOUBLE_NAME_1;
var DOUBLE_NAME_2 = require('./CHS_NAMES').DOUBLE_NAME_2;
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
}

/**
 * 对可能是人名的单词进行优化
 *
 * @param {array} words 单词数组
 * @return {array}
 */
exports.doOptimize = function (words) {
	// 合并相邻的能组成一个单词的两个词（仅当新词具有明确词性时）
	var TABLE = exports.segment.getDict('TABLE');
	var i = 0;
	var ie = words.length - 1;
	while (i < ie) {
		var w1 = words[i];
		var w2 = words[i + 1];
		var nw = w1.w + w2.w;
		if (nw in TABLE && TABLE[nw].p.length > 0) {
			words.splice(i, 2, {
				w:	nw,
				p:	TABLE[nw].p
			});
			ie--;
		}
		else
			i++;
	}
	
	return words;
}