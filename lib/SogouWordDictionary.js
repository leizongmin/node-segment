/**
 * 字典加载器
 */
 
var fs = require('fs'); 
var POSTAG = require('./POSTAG');
 
var WordDictionary = module.exports = function () {
	this.tables = {};		// 词表  '词' => 属性
	this.tables2 = {};	// 词表2   '长度'.'词' => 属性
}

/**
 * 载入字典文件
 *
 * @param {string} filename 文件名
 */
WordDictionary.prototype.load = function (filename) {
	var data = fs.readFileSync(filename, 'utf8');
	var lines = data.split(/\r?\n/);
	for (var i = 0, line; line = lines[i]; i++) {
		var blocks = line.split('\t');
		if (blocks.length > 2)
			this.add(blocks[0].trim(), blocks[2].trim().split(','), Number(blocks[1]));
	}
}

/**
 * 添加一个单词到字典里
 *
 * @param {string} word 单词
 * @param {int} pos 词性
 * @param {double} frequency 频率
 */
WordDictionary.prototype.add = function (word, pos, frequency) {
	var npos = [];
	for (var i in pos) {
		var p = POSTAG[pos[i]];
		if (!isNaN(p))
			npos.push(p);
	}
	pos = npos;
	this.tables[word] = {p: pos, f: frequency};
	var tables2 = this.tables2[word.length];
	if (!tables2)
		tables2 = this.tables2[word.length] = {};
	tables2[word] = {p: pos, f: frequency};
}

/**
 * 取单词属性
 *
 * @param {string} word 单词
 */
WordDictionary.prototype.get = function (word) {
	return this.tables[word];
}