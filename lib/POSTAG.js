'use strict';

/**
 * 单词类型
 */
 
var POSTAG = {}; 

POSTAG.D_A  = 0x40000000; // 形容词 形语素
POSTAG.D_B  = 0x20000000; // 区别词 区别语素
POSTAG.D_C  = 0x10000000; // 连词 连语素
POSTAG.D_D  = 0x08000000; // 副词 副语素
POSTAG.D_E  = 0x04000000; // 叹词 叹语素
POSTAG.D_F  = 0x02000000; // 方位词 方位语素
POSTAG.D_I  = 0x01000000; // 成语
POSTAG.D_L  = 0x00800000; // 习语
POSTAG.A_M  = 0x00400000; // 数词 数语素
POSTAG.D_MQ = 0x00200000; // 数量词
POSTAG.D_N  = 0x00100000; // 名词 名语素
POSTAG.D_O  = 0x00080000; // 拟声词
POSTAG.D_P  = 0x00040000; // 介词
POSTAG.A_Q  = 0x00020000; // 量词 量语素
POSTAG.D_R  = 0x00010000; // 代词 代语素
POSTAG.D_S  = 0x00008000; // 处所词
POSTAG.D_T  = 0x00004000; // 时间词
POSTAG.D_U  = 0x00002000; // 助词 助语素
POSTAG.D_V  = 0x00001000; // 动词 动语素
POSTAG.D_W  = 0x00000800; // 标点符号
POSTAG.D_X  = 0x00000400; // 非语素字
POSTAG.D_Y  = 0x00000200; // 语气词 语气语素
POSTAG.D_Z  = 0x00000100; // 状态词
POSTAG.A_NR = 0x00000080; // 人名
POSTAG.A_NS = 0x00000040; // 地名
POSTAG.A_NT = 0x00000020; // 机构团体
POSTAG.A_NX = 0x00000010; // 外文字符
POSTAG.A_NZ = 0x00000008; // 其他专名
POSTAG.D_ZH = 0x00000004; // 前接成分
POSTAG.D_K  = 0x00000002; // 后接成分
POSTAG.UNK  = 0x00000000; // 未知词性
POSTAG.URL  = 0x00000001; // 网址、邮箱地址

var _POSTAG = {};
for (var i in POSTAG) _POSTAG[i] = POSTAG[i];
for (var i in POSTAG) POSTAG[i.toLowerCase()] = POSTAG[i];


/** 中文说明 */
POSTAG.chsName = function (p) {
  if (isNaN(p)) {
    return CHSNAME[p] || CHSNAME.UNK;
  } else {
    var ret = [];
    for (var i in _POSTAG) {
      if ((p & _POSTAG[i]) > 0) {
        ret.push(CHSNAME[i]);
      }
    }
    if (ret.length < 1) {
      return CHSNAME.UNK;
    } else {
      return ret.toString();
    }
  }
};

var CHSNAME = POSTAG.CHSNAME = {};
POSTAG.CHSNAME.D_A  = '形容词 形语素';
POSTAG.CHSNAME.D_B  = '区别词 区别语素';
POSTAG.CHSNAME.D_C  = '连词 连语素';
POSTAG.CHSNAME.D_D  = '副词 副语素';
POSTAG.CHSNAME.D_E  = '叹词 叹语素';
POSTAG.CHSNAME.D_F  = '方位词 方位语素';
POSTAG.CHSNAME.D_I  = '成语';
POSTAG.CHSNAME.D_L  = '习语';
POSTAG.CHSNAME.A_M  = '数词 数语素';
POSTAG.CHSNAME.D_MQ = '数量词';
POSTAG.CHSNAME.D_N  = '名词 名语素';
POSTAG.CHSNAME.D_O  = '拟声词';
POSTAG.CHSNAME.D_P  = '介词';
POSTAG.CHSNAME.A_Q  = '量词 量语素';
POSTAG.CHSNAME.D_R  = '代词 代语素';
POSTAG.CHSNAME.D_S  = '处所词';
POSTAG.CHSNAME.D_T  = '时间词';
POSTAG.CHSNAME.D_U  = '助词 助语素';
POSTAG.CHSNAME.D_V  = '动词 动语素';
POSTAG.CHSNAME.D_W  = '标点符号';
POSTAG.CHSNAME.D_X  = '非语素字';
POSTAG.CHSNAME.D_Y  = '语气词 语气语素';
POSTAG.CHSNAME.D_Z  = '状态词';
POSTAG.CHSNAME.A_NR = '人名';
POSTAG.CHSNAME.A_NS = '地名';
POSTAG.CHSNAME.A_NT = '机构团体';
POSTAG.CHSNAME.A_NX = '外文字符';
POSTAG.CHSNAME.A_NZ = '其他专名';
POSTAG.CHSNAME.D_ZH = '前接成分';
POSTAG.CHSNAME.D_K  = '后接成分';
POSTAG.CHSNAME.UNK  = '未知';
POSTAG.CHSNAME.URL  = '网址 邮箱地址';

for (var i in CHSNAME) {
  CHSNAME[i.toLowerCase()] = CHSNAME[i];
}

module.exports = POSTAG;

