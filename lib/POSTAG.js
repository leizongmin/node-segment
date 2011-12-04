/**
 * 单词类型
 */
 
var POSTAG = module.exports;

/** 常量 */
POSTAG.UNK		= 0x0000;		// 未知

POSTAG.N		= 0x0010;		// 名词
POSTAG.NR		= 0x0011;		// 人名
POSTAG.PRON		= 0x0012;		// 代词

POSTAG.V		= 0x0020;		// 动词
POSTAG.ADJ		= 0x0030;		// 形容词
POSTAG.ADV		= 0x0040;		// 副词

POSTAG.CLAS		= 0x0050;		// 量词
POSTAG.NUM		= 0x0051;		// 数词

POSTAG.ECHO		= 0x0060;		// 拟声词

POSTAG.STRU		= 0x0070;		// 结构助词
POSTAG.AUX		= 0x0071;		// 助词

POSTAG.IDIOM	= 0x0080;		// 成语

POSTAG.COOR		= 0x0090;		// 并列连词
POSTAG.CONJ		= 0x0091;		// 连词

POSTAG.SUFFIX	= 0x00A0;		// 前缀
POSTAG.PREFIX	= 0x00A1;		// 后缀

POSTAG.PREP		= 0x00B0;		// 介词
POSTAG.QUES		= 0x00C0;		// 疑问词

POSTAG.DW		= 0x00D0;		// 标点符号
POSTAG.EN		= 0x00D1;		// 英文字符
POSTAG.URL		= 0x00D2;		// 网址



/** 中文说明 */
POSTAG.chsName = function (pos) {
	if (pos instanceof Array) {
		var ret = [];
		for (var i in pos)
			ret.push(POSTAG.chsName(pos[i]));
		return ret;
	}
	else {
		if (isNaN(pos))
			pos = POSTAG[pos];
		return POSTAG.CHSNAME[pos] || POSTAG.CHSNAME[POSTAG.UNK];
	}
}

POSTAG.CHSNAME = {
	0x0000:		'未知',
	
	0x0010:		'名词',
	0x0011:		'人名',
	0x0012:		'代词',
	
	0x0020:		'动词',
	0x0030:		'形容词',
	0x0040:		'副词',
	
	0x0050:		'量词',
	0x0051:		'数词',
	
	0x0060:		'拟声词',
	
	0x0070:		'结构助词',
	0x0071:		'助词',
	
	0x0080:		'成语',
	
	0x0090:		'并列连词',
	0x0091:		'连词',
	
	0x00A0:		'前缀',
	0x00A1:		'后缀',
	
	0x00B0:		'介词',
	0x00C0:		'疑问词',
	
	0x00D0:		'标点符号',
	0x00D1:		'英文字符',	
	0x00D2:		'网址'
}