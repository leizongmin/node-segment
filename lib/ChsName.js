/**
 * 中文人名
 */
 
var fs = require('fs');

var FAMILY_NAMES = [
	//有明显歧异的姓氏
	'王','张','黄','周','徐',
	'胡','高','林','马','于',
	'程','傅','曾','叶','余',
	'夏','钟','田','任','方',
	'石','熊','白','毛','江',
	'史','候','龙','万','段',
	'雷','钱','汤','易','常',
	'武','赖','文', '查',

	//没有明显歧异的姓氏
	'赵', '肖', '孙', '李',
	'吴', '郑', '冯', '陈', 
	'褚', '卫', '蒋', '沈', 
	'韩', '杨', '朱', '秦', 
	'尤', '许', '何', '吕', 
	'施', '桓', '孔', '曹',
	'严', '华', '金', '魏',
	'陶', '姜', '戚', '谢',
	'邹', '喻', '柏', '窦',
	'苏', '潘', '葛', '奚',
	'范', '彭', '鲁', '韦',
	'昌', '俞', '袁', '酆', 
	'鲍', '唐', '费', '廉',
	'岑', '薛', '贺', '倪',
	'滕', '殷', '罗', '毕',
	'郝', '邬', '卞', '康',
	'卜', '顾', '孟', '穆',
	'萧', '尹', '姚', '邵',
	'湛', '汪', '祁', '禹',
	'狄', '贝', '臧', '伏',
	'戴', '宋', '茅', '庞',
	'纪', '舒', '屈', '祝',
	'董', '梁', '杜', '阮',
	'闵', '贾', '娄', '颜',
	'郭', '邱', '骆', '蔡',
	'樊', '凌', '霍', '虞',
	'柯', '昝', '卢', '柯',
	'缪', '宗', '丁', '贲',
	'邓', '郁', '杭', '洪',
	'崔', '龚', '嵇', '邢',
	'滑', '裴', '陆', '荣',
	'荀', '惠', '甄', '芮',
	'羿', '储', '靳', '汲', 
	'邴', '糜', '隗', '侯',
	'宓', '蓬', '郗', '仲',
	'栾', '钭', '历', '戎',
	'刘', '詹', '幸', '韶',
	'郜', '黎', '蓟', '溥',
	'蒲', '邰', '鄂', '咸',
	'卓', '蔺', '屠', '乔',
	'郁', '胥', '苍', '莘',
	'翟', '谭', '贡', '劳',
	'冉', '郦', '雍', '璩',
	'桑', '桂', '濮', '扈',
	'冀', '浦', '庄', '晏',
	'瞿', '阎', '慕', '茹',
	'习', '宦', '艾', '容',
	'慎', '戈', '廖', '庾',
	'衡', '耿', '弘', '匡',
	'阙', '殳', '沃', '蔚',
	'夔', '隆', '巩', '聂',
	'晁', '敖', '融', '訾',
	'辛', '阚', '毋', '乜',
	'鞠', '丰', '蒯', '荆',
	'竺', '盍', '单', '欧',

	//复姓必须在单姓后面
	'司马', '上官', '欧阳',
	'夏侯', '诸葛', '闻人',
	'东方', '赫连', '皇甫',
	'尉迟', '公羊', '澹台',
	'公冶', '宗政', '濮阳',
	'淳于', '单于', '太叔',
	'申屠', '公孙', '仲孙',
	'轩辕', '令狐', '徐离',
	'宇文', '长孙', '慕容',
	'司徒', '司空', '万俟'];
			
var ChsName = module.exports = function () {
	this.names = {};
	this.names2 = {};
	this.tables = {};
	this.tables[this.SINGLE_NAME] = {};
	this.tables[this.DOUBLE_NAME_1] = {};
	this.tables[this.DOUBLE_NAME_2] = {};
	
	this.familynames = {s:{}, d:{}};
	for (var i = 0, w; w = FAMILY_NAMES[i]; i++)
		if (w.length == 1)
			this.familynames.s[w] = w.length;
		else
			this.familynames.d[w] = w.length;
}

/** 常量 */
ChsName.prototype.SINGLE_NAME = 0;			// 单名
ChsName.prototype.DOUBLE_NAME_1 = 1;		// 双名第一个字
ChsName.prototype.DOUBLE_NAME_2 = 2;		// 双名第二个字
ChsName.prototype.COMMON_NAME_1 = 3;		// 姓名
ChsName.prototype.COMMON_NAME_2 = 4;		// 其他名称

/**
 * 载入字典文件
 *
 * @param {string} filename 文件名
 * @param {int} type 类型
 */
ChsName.prototype.load = function (filename, type) {
	if (isNaN(type))
		type = this.SINGLE_NAME;
	if (type == this.COMMON_NAME_1) {
		this.loadNames(filename);
	}
	else if (type == this.COMMON_NAME_2) {
		this.loadNames(filename, true);
	}
	else {	
		if (!this.tables[type])
			this.tables[type] = {};
		
		var data = fs.readFileSync(filename, 'utf8');
		var lines = data.split(/\r?\n/);
		
		for (var i = 0, line; line = lines[i]; i++)
			this.add(line.trim(), type);
	}
}

/**
 * 添加单词
 *
 * @param {string} word 单词
 * @param {int} type 类型
 */
ChsName.prototype.add = function (word, type) {
	this.tables[type][word] = word.length;
}

/**
 * 载入固定名字
 *
 * @param {string} filename 文件名
 * @param {bool} is_ommon_name 是否为其他名称
 */
ChsName.prototype.loadNames = function (filename, is_ommon_name) {
	var data = fs.readFileSync(filename, 'utf8');
	var lines = data.toLowerCase().split(/\r?\n/);
	
	for (var i = 0, line; line = lines[i]; i++)
		this.addName(line.trim(), is_ommon_name);
}

/**
 * 添加姓名
 *
 * @param {string} word
 * @param {bool} is_ommon_name 是否为其他名称
 */
ChsName.prototype.addName = function (word, is_ommon_name) {
	if (!this.names2[word.length])
		var table = this.names2[word.length] = {};
	else
		var table = this.names2[word.length];
	this.names[word] = table[word] = is_ommon_name ? -1 : word.length;
}

/**
 * 匹配姓名
 *
 * @param {string} text 字符串
 * @param {int} cur 开始位置
 * @return {array}
 */
ChsName.prototype.match = function (text, cur) {
	text = text.toLowerCase();
	if (isNaN(cur))
		cur = 0;
	
	var familynames = this.familynames;
	var singlenames = this.tables[this.SINGLE_NAME];
	var doublenames1 = this.tables[this.DOUBLE_NAME_1];
	var doublenames2 = this.tables[this.DOUBLE_NAME_2];
	
	var ret = {};
	if (text.length < 2)
		return false;
	
	while (text.length - cur > 1) {
		var name = false;
		
		//=================== 匹配常用姓名、名称 ====================
		for (var i in this.names2) {
			var table = this.names2[i];
			var n = text.substr(cur, i);
			if (n in table)
				name = addName(ret, n, cur);
		}
		//=================== 猜称呼：“老|小”后面跟姓名，如 老王、小王 ====================
		if (name === false) {
			var n = text.substr(cur, 1);
			if (n == '老' || n == '小') {
				var n1 = text.substr(cur + 1, 1);
				var n2 = text.substr(cur + 1, 2);
				if (n2 in familynames.d)
					name = addName(ret, n + n2, cur);
				else if (n1 in familynames.s)
					name = addName(ret, n + n1, cur);
			}
		}
		//=================== 猜姓名 ========================
		if (name === false) {
			// 获取姓
			var s = text.substr(cur, 1);
			var d = text.substr(cur, 2);
			
			// 优先匹配复姓
			if (d in familynames.d) {
				var n1 = text.charAt(cur + 2);
				var n2 = text.charAt(cur + 3);
				// 优先匹配双名
				if (n1 in doublenames1 && n2 in doublenames2)
					name = addName(ret, text.substr(cur, 4), cur);
				// 单名
				else if (n1 in singlenames)
					name = addName(ret, text.substr(cur, 3), cur);
			}
			// 匹配单姓
			else if (s in familynames.s) {
				var n1 = text.charAt(cur + 1);
				var n2 = text.charAt(cur + 2);
				// 姓和名的第一个字不能组成复姓
				if (!((s + n1) in familynames.d)) {
					// 双名
					if (n1 in doublenames1 && n2 in doublenames2)
						name = addName(ret, text.substr(cur, 3), cur);
					// 单名，或者名两个字相同
					if (n1 in singlenames)
						name = addName(ret, text.substr(cur, (n1 == n2 ? 3 : 2)), cur);
				}
			}
		}
		if (name)
			cur += name.w.length;
		else
			cur++;
	}
	
	// 将结果转换为数组形式
	var ret2 = [];
	for (var i in ret)
		ret2.push(ret[i]);
	return ret2;
}

/**
 * 将姓名添加到结果中
 *
 * @param {object} ret 存储结果的对象
 * @param {string} name 名字
 * @param {int} cur 位置
 * @return {object}
 */
var addName = function (ret, name, cur) {
	if (!ret[cur])
		ret[cur] = {w: name, c: cur};
	else
		if (name.length > ret[cur].w.length)
			ret[cur] = {w: name, c: cur};
	return ret[cur];
}

/**
 * 匹配人名，不包含姓
 *
 * @param {string} text 字符串
 * @param {int} cur 开始位置
 * @return {array}
 */
ChsName.prototype.matchNameOnly = function (text, cur) {
	text = text.toLowerCase();
	if (isNaN(cur))
		cur = 0;
	
	var singlenames = this.tables[this.SINGLE_NAME];
	var doublenames1 = this.tables[this.DOUBLE_NAME_1];
	var doublenames2 = this.tables[this.DOUBLE_NAME_2];
	
	var ret = {};
	var cur = 0;
	if (text.length < 2)
		return false;
	
	while (text.length - cur > 1) {
		var name = false;
		//=================== 猜姓名，人名必须为两个字， 啊|阿 + 单名（双字）， 或者是双名 ========================
		var n1 = text.charAt(cur);
		var n2 = text.charAt(cur + 1);
		var n3 = text.charAt(cur + 2);
		
		// 啊|阿 + 单名（双字）
		if (n1 == '啊' || n1 == '阿') {
			// 啊|阿 + 双名
			if (n2 in doublenames1 && n3 in doublenames2)
				name = addName(ret, text.substr(cur, 3), cur);
			// 啊|阿 + 单名（双字）
			else if (n2 in singlenames)
				name = addName(ret, text.substr(cur, (n2 == n3 ? 3 : 2)), cur);
		}
		// 双名 或 单名（双字）
		else if ((n1 in doublenames1 && n2 in doublenames2) || (n1 in singlenames && n1 == n2)) {
			name = addName(ret, text.substr(cur, 2), cur);
		}
		
		if (name)
			cur += name.w.length;
		else
			cur++;
	}
	
	// 将结果转换为数组形式
	var ret2 = [];
	for (var i in ret)
		ret2.push(ret[i]);
	return ret2;
}