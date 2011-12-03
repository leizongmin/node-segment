/**
 * 停用词
 */
 
var fs = require('fs'); 
 
var StopWord = module.exports = function () {
	this.tables = {};		// 词表  '词' => 属性
	this.tables2 = {};	// 词表2   '长度'.'词' => 属性
}

/**
 * 载入字典文件
 *
 * @param {string} filename 文件名
 */
StopWord.prototype.load = function (filename) {
	var data = fs.readFileSync(filename, 'utf8');
	var lines = data.split(/\r?\n/);
	
	for (var i = 0, line; line = lines[i]; i++)
		this.add(line.toLowerCase());
}

/**
 * 添加一个单词
 *
 * @param {string} word
 */
StopWord.prototype.add = function (word) {
	this.tables[word] = word.length;
	var tables2 = this.tables2[word.length];
	if (!tables2)
		tables2 = this.tables2[word.length] = {};
	tables2[word] = word.length;
}

/**
 * 返回下一个停止符的位置
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}
 */
StopWord.prototype.split = function (text, cur) {
	if (!cur)
		cur = 0;
	var ret = [];
	while (cur < text.length) {
		for (var i in this.tables2) {
			var table = this.tables2[i];
			var word = text.substr(cur, i);
			if (word in table) {
				ret.push({
					w:	word,
					c:	cur
				});
				cur += word.length - 1;
				break;
			}
		}
		cur++;
	}
	return ret;
}