/**
 * 同义词
 */
 
var fs = require('fs'); 
 
var Synonym = module.exports = function () {
	this.tables = {};
	this.groups = {};
}

/**
 * 载入字典文件
 *
 * @param {string} filename 文件名
 */
Synonym.prototype.load = function (filename) {
	var data = fs.readFileSync(filename, 'utf8');
	var lines = data.split(/\r?\n/);
	
	for (var i = 0, line; line = lines[i]; i++) {
		var blocks = line.split(',');
		this.addGroup(i, blocks);
		for (var j = 0, word; word = blocks[j]; j++)
			this.add(i, word.trim());
	}
}

/**
 * 添加一个单词
 *
 * @param {int} groupid 组ID
 * @param {string} word 单词
 */
Synonym.prototype.add = function (groupid, word) {
	this.tables[word] = groupid;
}

/**
 * 添加同义词组
 *
 * @param {int} groupid 组ID
 * @param {array} words 同义词数组
 */
Synonym.prototype.addGroup = function (groupid, words) {
	this.groups[groupid] = words;
}

/**
 * 取同义词
 *
 * @param {string} word 单词
 * @return {array} words
 */
Synonym.prototype.get = function (word) {
	var groupid = this.tables[word];
	if (isNaN(groupid))
		return false;
		
	var ret = [];
	var words = this.groups[groupid];
	for (var i  = 0, w; w = words[i]; i++)
		if (w != word)
			ret.push(w);
	return ret;
}