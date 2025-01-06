// eslint-disable

import { createHash } from "crypto";

const Q = new RegExp(
    "[`~!@#$%^&*()+=|{}':;',\\[\\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]",
  ),
  W = (e: any) => {
    const t = [
        "`",
        "~",
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        "+",
        "=",
        "|",
        "{",
        "}",
        "'",
        ":",
        ";",
        "'",
        ",",
        "[",
        "]",
        ".",
        "<",
        ">",
        "/",
        "?",
        "~",
        "！",
        "@",
        "#",
        "￥",
        "%",
        "…",
        "…",
        "&",
        "*",
        "（",
        "）",
        "—",
        "—",
        "+",
        "|",
        "{",
        "}",
        "【",
        "】",
        "‘",
        "；",
        "：",
        "”",
        "“",
        "’",
        "。",
        "，",
        "、",
        "？",
        '"',
      ],
      n = [
        "content",
        "deviceName",
        "keyWord",
        "blogBody",
        "blogTitle",
        "getType",
        "responsibilities",
        "street",
        "text",
        "reason",
        "searchvalue",
        "key",
        "answers",
        "leaveReason",
        "personRemark",
        "selfAppraisal",
        "imgUrl",
        "wxname",
        "deviceId",
        "avatarTempPath",
        "file",
        "file",
        "model",
        "brand",
        "system",
        "deviceId",
        "platform",
        "code",
        "openId",
        "unionid",
        "clockDeviceToken",
        "clockDevice",
      ];
    for (const a in e) {
      const o = String(e[a]);
      o.split("").some((e) => {
        if (t.indexOf(e) > -1) return -1 == n.indexOf(a) && n.push(a), !0;
      });
    }
    return n;
  },
  V = () => {
    const e = [
      "front/enterprise/loadEnterprise.action",
      "front/post/EnterprisePostLoad.action",
      "helpcenter/video/VideoPlayAuth.action",
      "login/teacher/sendMobileOrEmailCode.action",
      "login/student/sendMobileCode.action",
    ];
    return e;
  },
  z = (e: any) => {
    //分割字符串
    if (void 0 == e) return {};
    for (var t = Object.keys(e).sort(), n: any = {}, a = 0; a < t.length; a++)
      n[t[a]] = e[t[a]];
    return n;
  },
  F = (e: any, t: any) => {
    //生成(e.length - t)个随机排序的数字
    let n,
      a,
      o = e.slice(0),
      i = e.length,
      r = i - t;
    while (i-- > r)
      (a = Math.floor((i + 1) * Math.random())),
        (n = o[a]),
        (o[a] = o[i]),
        (o[i] = n);
    return o.slice(r);
  },
  H = (e: any, _t: any) => {
    const n = [
        "5",
        "b",
        "f",
        "A",
        "J",
        "Q",
        "g",
        "a",
        "l",
        "p",
        "s",
        "q",
        "H",
        "4",
        "L",
        "Q",
        "g",
        "1",
        "6",
        "Q",
        "Z",
        "v",
        "w",
        "b",
        "c",
        "e",
        "2",
        "2",
        "m",
        "l",
        "E",
        "g",
        "G",
        "H",
        "I",
        "r",
        "o",
        "s",
        "d",
        "5",
        "7",
        "x",
        "t",
        "J",
        "S",
        "T",
        "F",
        "v",
        "w",
        "4",
        "8",
        "9",
        "0",
        "K",
        "E",
        "3",
        "4",
        "0",
        "m",
        "r",
        "i",
        "n",
      ],
      a: string[] = [];
    for (let u = 0; u < 62; u++) a.push(u + "");
    let o = Math.round(new Date().getTime() / 1e3),
      i = F(a, 20),
      r = "";
    i.forEach((e: any, _t: any) => {
      r += n[e];
    });
    const s: any = z(e);
    let c = "";
    //!(过滤的字段 ||  特殊字符）不添加到字符串中  过滤 &nbsp;
    // 过滤出参与加密的字段
    for (const l in s) {
      -1 != W(e).indexOf(l) ||
        Q.test(s[l]) ||
        (null != s[l] && "" !== s[l] && '""' !== s[l] && (c += s[l]));
    }
    return (
      (c += o),
      (c += r),
      (c = c.replace(/\s+/g, "")),
      (c = c.replace(/\n+/g, "")),
      (c = c.replace(/\r+/g, "")),
      (c = c.replace(/</g, "")),
      (c = c.replace(/>/g, "")),
      (c = c.replace(/&/g, "")),
      (c = c.replace(/-/g, "")),
      (c = c.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")),
      (c = encodeURIComponent(c)),
      (c = createHash("md5").update(c).digest("hex")),
      {
        md5: c,
        tstr: o,
        iArrStr: i && i.length > 0 ? i.join("_") : "",
      }
    );
  },
  Y = (e: any, _t: any) => {
    if (!e) return;
    let n = [
        "5",
        "b",
        "f",
        "A",
        "J",
        "Q",
        "g",
        "a",
        "l",
        "p",
        "s",
        "q",
        "H",
        "4",
        "L",
        "Q",
        "g",
        "1",
        "6",
        "Q",
        "Z",
        "v",
        "w",
        "b",
        "c",
        "e",
        "2",
        "2",
        "m",
        "l",
        "E",
        "g",
        "G",
        "H",
        "I",
        "r",
        "o",
        "s",
        "d",
        "5",
        "7",
        "x",
        "t",
        "J",
        "S",
        "T",
        "F",
        "v",
        "w",
        "4",
        "8",
        "9",
        "0",
        "K",
        "E",
        "3",
        "4",
        "0",
        "m",
        "r",
        "i",
        "n",
      ],
      a = e.t,
      o = e.s.split("_"),
      i = "";
    o.forEach((e: any, _t: any) => {
      i += n[e];
    });
    let r = "";
    return (
      (r += a),
      (r += i),
      (r = r.replace(/\s+/g, "")),
      (r = r.replace(/\n+/g, "")),
      (r = r.replace(/\r+/g, "")),
      (r = r.replace(/</g, "")),
      (r = r.replace(/>/g, "")),
      (r = r.replace(/&/g, "")),
      (r = r.replace(/-/g, "")),
      (r = r.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")),
      (r = encodeURIComponent(r)),
      (r = createHash("md5").update(r).digest("hex")),
      r == e.m
    );
  };
const Z = {
  getTokenData: H,
  checkToken: Y,
  nocheckArrs: W,
  checkUrl: V,
};

export const xybMstv = function (data: any) {
  const headers: any = {
    Host: "xcx.xybsyw.com",
    Connection: "keep-alive",
    "User-agent":
      "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.9.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat",
    // referer: "https://servicewechat.com/wx9f1c2e0bbc10673c/317/page-frame.html",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "content-type": "application/x-www-form-urlencoded",
    v: "1.6.36",
    // xweb_xhr: 1,
  };
  const n = Z.nocheckArrs(data).join(","),
    a = Z.getTokenData(data, "");
  Z.checkUrl();
  (headers.n = n),
    (headers.m = a.md5),
    (headers.t = a.tstr),
    (headers.s = a.iArrStr);
  return headers;
};
