var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app,
  default: () => app_default
});
module.exports = __toCommonJS(app_exports);
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv2 = __toESM(require("dotenv"), 1);

// src/initial_data.json
var initial_data_default = {
  digital_marketing: [
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 11e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 72170246
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 7333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 5427273
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 2095238,
      t\u00EDch_l\u0169y_th\u00E1ng: 2383099
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 13.298
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.28
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 74e6,
      th\u1EF1c_t\u1EBF_actual: 65079010,
      target_th\u00E1ng: 15e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 65079010
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 5285714,
      th\u1EF1c_t\u1EBF_actual: 7799785,
      target_th\u00E1ng: 10714286,
      t\u00EDch_l\u0169y_th\u00E1ng: 7799785
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 2114286,
      th\u1EF1c_t\u1EBF_actual: 3251131,
      target_th\u00E1ng: 3061225,
      t\u00EDch_l\u0169y_th\u00E1ng: 3251131
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 8.344,
      target_th\u00E1ng: 14,
      t\u00EDch_l\u0169y_th\u00E1ng: 8.344
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.5,
      th\u1EF1c_t\u1EBF_actual: 2.4,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.4
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 25e6,
      th\u1EF1c_t\u1EBF_actual: 24981308,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 64576492
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 125e4,
      th\u1EF1c_t\u1EBF_actual: 1771559,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 4555773
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 625e3,
      th\u1EF1c_t\u1EBF_actual: 984199,
      target_th\u00E1ng: 225e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 2847358
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 20,
      th\u1EF1c_t\u1EBF_actual: 14.1,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.2
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.8,
      target_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 1.6
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 47e6,
      th\u1EF1c_t\u1EBF_actual: 46889687,
      target_th\u00E1ng: 22e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 177479983
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 3916667,
      th\u1EF1c_t\u1EBF_actual: 4267063,
      target_th\u00E1ng: 18333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 16147371
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1958333,
      th\u1EF1c_t\u1EBF_actual: 2530774,
      target_th\u00E1ng: 6111111,
      t\u00EDch_l\u0169y_th\u00E1ng: 6248194
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 10.99,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 11
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.7,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.6
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 12e7,
      th\u1EF1c_t\u1EBF_actual: 116870149,
      target_th\u00E1ng: 505e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 390701037
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 12e6,
      th\u1EF1c_t\u1EBF_actual: 12723001,
      target_th\u00E1ng: 42083333,
      t\u00EDch_l\u0169y_th\u00E1ng: 41893833
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 4e6,
      th\u1EF1c_t\u1EBF_actual: 4642626,
      target_th\u00E1ng: 84166669,
      t\u00EDch_l\u0169y_th\u00E1ng: 8629140
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 10,
      th\u1EF1c_t\u1EBF_actual: 9.19,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 9.3
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 2.7,
      target_th\u00E1ng: 5,
      t\u00EDch_l\u0169y_th\u00E1ng: 4.9
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 19099722,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 70519653
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1333333,
      th\u1EF1c_t\u1EBF_actual: 1337057,
      target_th\u00E1ng: 6923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 5972230
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 774701,
      target_th\u00E1ng: 2307692,
      t\u00EDch_l\u0169y_th\u00E1ng: 2176247
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 14.3,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.8
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.7,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.7
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 85e6,
      th\u1EF1c_t\u1EBF_actual: 82109829,
      target_th\u00E1ng: 35e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 277584787
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 6538461,
      th\u1EF1c_t\u1EBF_actual: 6971565,
      target_th\u00E1ng: 26923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 24159025
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 2972028,
      th\u1EF1c_t\u1EBF_actual: 3393440,
      target_th\u00E1ng: 6730769,
      t\u00EDch_l\u0169y_th\u00E1ng: 6471386
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 13,
      th\u1EF1c_t\u1EBF_actual: 11.8,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.5
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.2,
      th\u1EF1c_t\u1EBF_actual: 2.1,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.7
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 48e6,
      th\u1EF1c_t\u1EBF_actual: 47528858,
      target_th\u00E1ng: 185e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 150426798
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 34285716,
      th\u1EF1c_t\u1EBF_actual: 3535324,
      target_th\u00E1ng: 14230769,
      t\u00EDch_l\u0169y_th\u00E1ng: 12608048
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1714285,
      th\u1EF1c_t\u1EBF_actual: 1932859,
      target_th\u00E1ng: 4743590,
      t\u00EDch_l\u0169y_th\u00E1ng: 4352332
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 13.4,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.9
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.8,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.9
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 95e6,
      th\u1EF1c_t\u1EBF_actual: 95171325,
      target_th\u00E1ng: 47e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 370883857
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 6785714,
      th\u1EF1c_t\u1EBF_actual: 7450291,
      target_th\u00E1ng: 36153846,
      t\u00EDch_l\u0169y_th\u00E1ng: 30187692
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 3392857,
      th\u1EF1c_t\u1EBF_actual: 3813651,
      target_th\u00E1ng: 9038461,
      t\u00EDch_l\u0169y_th\u00E1ng: 8288765
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 12.8,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 12.3
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.6
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 19905107,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 71448844
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1333333,
      th\u1EF1c_t\u1EBF_actual: 1361407,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 4980569
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 716530,
      target_th\u00E1ng: 18e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2165465
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 14.6,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.3
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.9,
      target_th\u00E1ng: 2.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.3
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 4860,
      th\u1EF1c_t\u1EBF_actual: 3246,
      target_th\u00E1ng: 15e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 10814
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 158e3,
      th\u1EF1c_t\u1EBF_actual: 148962,
      target_th\u00E1ng: 525e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 459648
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 5,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 7
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "instagram",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 11
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 5
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "karofi",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.359,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kang",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.409,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "livotec",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.028,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "sunhouse",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.144,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\xF2a ph\xE1t",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.031,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kh\xE1c",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.028999999999999915,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 78e6,
      th\u1EF1c_t\u1EBF_actual: 75065269,
      target_th\u00E1ng: 271329254,
      t\u00EDch_l\u0169y_th\u00E1ng: 39e7
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 78e5,
      th\u1EF1c_t\u1EBF_actual: 8091316,
      target_th\u00E1ng: 28400558,
      t\u00EDch_l\u0169y_th\u00E1ng: 38235294
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 325e4,
      th\u1EF1c_t\u1EBF_actual: 3576289,
      target_th\u00E1ng: 7546305,
      t\u00EDch_l\u0169y_th\u00E1ng: 9558824
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 10,
      th\u1EF1c_t\u1EBF_actual: 9.277263303027592,
      target_th\u00E1ng: 9.553659262610262,
      t\u00EDch_l\u0169y_th\u00E1ng: 10.2
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.4,
      th\u1EF1c_t\u1EBF_actual: 2.262489412908185,
      target_th\u00E1ng: 3.7635051856504607,
      t\u00EDch_l\u0169y_th\u00E1ng: 4
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 18e3,
      th\u1EF1c_t\u1EBF_actual: 18852,
      target_th\u00E1ng: 65917,
      t\u00EDch_l\u0169y_th\u00E1ng: 8e4
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 5e5,
      th\u1EF1c_t\u1EBF_actual: 548338,
      target_th\u00E1ng: 2034577,
      t\u00EDch_l\u0169y_th\u00E1ng: 25e5
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 4,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ooh/led",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "s\u1EA3n xu\u1EA5t \u1EA5n ph\u1EA9m",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video/\u1EA3nh",
      m\u1EE5c_ti\u00EAu_target: 6,
      th\u1EF1c_t\u1EBF_actual: 6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "ch\u1EC9nh s\u1EEDa content mang t\xEDnh tuy\u1EC7t \u0111\u1ED1i nh\u1EA5t/duy nh\u1EA5t/...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i edited",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 20017347,
      target_th\u00E1ng: 11e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 72170246
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1666667,
      th\u1EF1c_t\u1EBF_actual: 1715684,
      target_th\u00E1ng: 7333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 5427273
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1111111,
      th\u1EF1c_t\u1EBF_actual: 1091755,
      target_th\u00E1ng: 2095238,
      t\u00EDch_l\u0169y_th\u00E1ng: 2383099
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 11.67,
      target_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 13.3
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.57,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.28
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 15e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 39595199
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 10714285,
      t\u00EDch_l\u0169y_th\u00E1ng: 2784215
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 3061224,
      t\u00EDch_l\u0169y_th\u00E1ng: 2141704
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 14,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.22
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 1.3
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 5e7,
      th\u1EF1c_t\u1EBF_actual: 48024651,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 130588942
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 4166667,
      th\u1EF1c_t\u1EBF_actual: 4031053,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 11879858
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 2083333,
      th\u1EF1c_t\u1EBF_actual: 2352579,
      target_th\u00E1ng: 225e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 4996013
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 11.91,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 10992
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.71,
      target_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.38
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 12e7,
      th\u1EF1c_t\u1EBF_actual: 116870149,
      target_th\u00E1ng: 22e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 290186793
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 12e6,
      th\u1EF1c_t\u1EBF_actual: 12722997,
      target_th\u00E1ng: 18333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 31850679
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 4e6,
      th\u1EF1c_t\u1EBF_actual: 4642626,
      target_th\u00E1ng: 6111111,
      t\u00EDch_l\u0169y_th\u00E1ng: 7841881
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 10,
      th\u1EF1c_t\u1EBF_actual: 9.19,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 9.11
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 2.74,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 4.06
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 20283907,
      target_th\u00E1ng: 505e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 51419499
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1538462,
      th\u1EF1c_t\u1EBF_actual: 1668125,
      target_th\u00E1ng: 42083333,
      t\u00EDch_l\u0169y_th\u00E1ng: 4634976
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 769231,
      th\u1EF1c_t\u1EBF_actual: 927444,
      target_th\u00E1ng: 8416667,
      t\u00EDch_l\u0169y_th\u00E1ng: 1858480
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 13,
      th\u1EF1c_t\u1EBF_actual: 12.16,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.09
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.8,
      target_th\u00E1ng: 5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.49
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 79856394,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 195474958
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1666667,
      th\u1EF1c_t\u1EBF_actual: 6488559,
      target_th\u00E1ng: 6923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 17187451
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1111111,
      th\u1EF1c_t\u1EBF_actual: 3042387,
      target_th\u00E1ng: 2307692,
      t\u00EDch_l\u0169y_th\u00E1ng: 5494588
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12.31,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.37
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 2.13,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.13
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 40515267,
      target_th\u00E1ng: 35e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 102897490
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1666667,
      th\u1EF1c_t\u1EBF_actual: 3357508,
      target_th\u00E1ng: 26923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 9072416
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1111111,
      th\u1EF1c_t\u1EBF_actual: 1838440,
      target_th\u00E1ng: 6730769,
      t\u00EDch_l\u0169y_th\u00E1ng: 3485980
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12.07,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.34
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.83,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.6
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 125e6,
      th\u1EF1c_t\u1EBF_actual: 124653698,
      target_th\u00E1ng: 185e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 275712532
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 8928571,
      th\u1EF1c_t\u1EBF_actual: 9432968,
      target_th\u00E1ng: 14230769,
      t\u00EDch_l\u0169y_th\u00E1ng: 22737397
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 4058442,
      th\u1EF1c_t\u1EBF_actual: 4426e3,
      target_th\u00E1ng: 4743589,
      t\u00EDch_l\u0169y_th\u00E1ng: 7320645
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 13.22,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 12.13
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.2,
      th\u1EF1c_t\u1EBF_actual: 2.13,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.11
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 20120635,
      target_th\u00E1ng: 47e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 51545414
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1333333,
      th\u1EF1c_t\u1EBF_actual: 1448166,
      target_th\u00E1ng: 36153846,
      t\u00EDch_l\u0169y_th\u00E1ng: 3619271
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 804537,
      target_th\u00E1ng: 9038461,
      t\u00EDch_l\u0169y_th\u00E1ng: 1809636
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 13.89,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.24
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.8,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 4320,
      th\u1EF1c_t\u1EBF_actual: 2827,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 13e4,
      th\u1EF1c_t\u1EBF_actual: 108740,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 716530,
      target_th\u00E1ng: 18e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2165465
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 14.6,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.3
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.9,
      target_th\u00E1ng: 2.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.3
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 4860,
      th\u1EF1c_t\u1EBF_actual: 3246,
      target_th\u00E1ng: 15e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 10814
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 158e3,
      th\u1EF1c_t\u1EBF_actual: 148962,
      target_th\u00E1ng: 525e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 459648
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "facebook\n(always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt\n(single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 5,
      th\u1EF1c_t\u1EBF_actual: 5,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 5
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "instagram",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 5
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 6
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 3
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "htv & thvl",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "karofi",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.374,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kang",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.384,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "livotec",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.034,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "sunhouse",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.145,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\xF2a ph\xE1t",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.031,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kh\xE1c",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.032,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 8e7,
      th\u1EF1c_t\u1EBF_actual: 79849386,
      target_th\u00E1ng: 369309113,
      t\u00EDch_l\u0169y_th\u00E1ng: 195733830
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 8e6,
      th\u1EF1c_t\u1EBF_actual: 7958970,
      target_th\u00E1ng: 36875673,
      t\u00EDch_l\u0169y_th\u00E1ng: 20281620
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 32e5,
      th\u1EF1c_t\u1EBF_actual: 3283137,
      target_th\u00E1ng: 10488247,
      t\u00EDch_l\u0169y_th\u00E1ng: 6292948
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 10,
      th\u1EF1c_t\u1EBF_actual: 10,
      target_th\u00E1ng: 10,
      t\u00EDch_l\u0169y_th\u00E1ng: 9.7
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.5,
      th\u1EF1c_t\u1EBF_actual: 2.4,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.2
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 18e3,
      th\u1EF1c_t\u1EBF_actual: 17551,
      target_th\u00E1ng: 8e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 47087
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 5e5,
      th\u1EF1c_t\u1EBF_actual: 566381,
      target_th\u00E1ng: 25e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 1486224
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook\n(always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt\n(single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 5,
      th\u1EF1c_t\u1EBF_actual: 5,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "e-com",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "ch\u1EC9nh s\u1EEDa content mang t\xEDnh tuy\u1EC7t \u0111\u1ED1i nh\u1EA5t/duy nh\u1EA5t/...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i edited",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 19736264,
      target_th\u00E1ng: 11e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 91906814
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1428571,
      th\u1EF1c_t\u1EBF_actual: 1559549,
      target_th\u00E1ng: 7333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 6987028
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 952381,
      th\u1EF1c_t\u1EBF_actual: 1051252,
      target_th\u00E1ng: 2095238,
      t\u00EDch_l\u0169y_th\u00E1ng: 2949007
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 12.7,
      target_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 13.2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.5,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.4
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 25e6,
      th\u1EF1c_t\u1EBF_actual: 23636894,
      target_th\u00E1ng: 15e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 88715904
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 2083333,
      th\u1EF1c_t\u1EBF_actual: 2432193,
      target_th\u00E1ng: 10714285,
      t\u00EDch_l\u0169y_th\u00E1ng: 10232592
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1388889,
      th\u1EF1c_t\u1EBF_actual: 1593121,
      target_th\u00E1ng: 3061224,
      t\u00EDch_l\u0169y_th\u00E1ng: 3872534
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 9.7,
      target_th\u00E1ng: 14,
      t\u00EDch_l\u0169y_th\u00E1ng: 8.7
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "tiktok (koc/kol)",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.5,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.6
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 25e6,
      th\u1EF1c_t\u1EBF_actual: 25000931,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 89563889
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 125e4,
      th\u1EF1c_t\u1EBF_actual: 1739875,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 6294993
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 625e3,
      th\u1EF1c_t\u1EBF_actual: 1087422,
      target_th\u00E1ng: 225e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 3497218
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 20,
      th\u1EF1c_t\u1EBF_actual: 14.4,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.6,
      target_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 1.8
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 45e6,
      th\u1EF1c_t\u1EBF_actual: 43138473,
      target_th\u00E1ng: 22e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 220620598
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 3916667,
      th\u1EF1c_t\u1EBF_actual: 3422336,
      target_th\u00E1ng: 18333333,
      t\u00EDch_l\u0169y_th\u00E1ng: 19569775
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1958333,
      th\u1EF1c_t\u1EBF_actual: 2140147,
      target_th\u00E1ng: 6111111,
      t\u00EDch_l\u0169y_th\u00E1ng: 7024651
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 12.6,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.3
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.6,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.8
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 3e7,
      th\u1EF1c_t\u1EBF_actual: 30057012,
      target_th\u00E1ng: 505e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 420758049
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 25e5,
      th\u1EF1c_t\u1EBF_actual: 2729045,
      target_th\u00E1ng: 42083333,
      t\u00EDch_l\u0169y_th\u00E1ng: 44623810
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1666667,
      th\u1EF1c_t\u1EBF_actual: 1906790,
      target_th\u00E1ng: 8416667,
      t\u00EDch_l\u0169y_th\u00E1ng: 8849376
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 11,
      target_th\u00E1ng: 12,
      t\u00EDch_l\u0169y_th\u00E1ng: 9.4
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.4,
      target_th\u00E1ng: 5,
      t\u00EDch_l\u0169y_th\u00E1ng: 5
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 20896158,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 91416527
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1333333,
      th\u1EF1c_t\u1EBF_actual: 1435150,
      target_th\u00E1ng: 6923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 7407414
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 909135,
      target_th\u00E1ng: 2307692,
      t\u00EDch_l\u0169y_th\u00E1ng: 2555298
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 14.6,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 12.3
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.6,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.9
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 22e6,
      th\u1EF1c_t\u1EBF_actual: 21413925,
      target_th\u00E1ng: 35e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 298998712
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1692308,
      th\u1EF1c_t\u1EBF_actual: 1675579,
      target_th\u00E1ng: 26923077,
      t\u00EDch_l\u0169y_th\u00E1ng: 25835127
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1128205,
      th\u1EF1c_t\u1EBF_actual: 1329868,
      target_th\u00E1ng: 6730769,
      t\u00EDch_l\u0169y_th\u00E1ng: 6667738
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 13,
      th\u1EF1c_t\u1EBF_actual: 12.8,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 11.6
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.3,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.9
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 53e6,
      th\u1EF1c_t\u1EBF_actual: 52476485,
      target_th\u00E1ng: 185e6,
      t\u00EDch_l\u0169y_th\u00E1ng: 202905032
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 3785714,
      th\u1EF1c_t\u1EBF_actual: 3805638,
      target_th\u00E1ng: 14230769,
      t\u00EDch_l\u0169y_th\u00E1ng: 16413766
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1892857,
      th\u1EF1c_t\u1EBF_actual: 2428098,
      target_th\u00E1ng: 4743589,
      t\u00EDch_l\u0169y_th\u00E1ng: 5362524
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 13.8,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 12.4
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.6,
      target_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.1
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 25e6,
      th\u1EF1c_t\u1EBF_actual: 24546753,
      target_th\u00E1ng: 47e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 395430610
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1785714,
      th\u1EF1c_t\u1EBF_actual: 2018557,
      target_th\u00E1ng: 36153846,
      t\u00EDch_l\u0169y_th\u00E1ng: 32206891
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 1190476,
      th\u1EF1c_t\u1EBF_actual: 1530766,
      target_th\u00E1ng: 9038461,
      t\u00EDch_l\u0169y_th\u00E1ng: 8538428
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 14,
      th\u1EF1c_t\u1EBF_actual: 12.2,
      target_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: 12.3
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tiktok",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 1.5,
      th\u1EF1c_t\u1EBF_actual: 1.3,
      target_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.8
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 2e7,
      th\u1EF1c_t\u1EBF_actual: 19996043,
      target_th\u00E1ng: 9e7,
      t\u00EDch_l\u0169y_th\u00E1ng: 91430004
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 1333333,
      th\u1EF1c_t\u1EBF_actual: 1352371,
      target_th\u00E1ng: 45e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 6331976
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 666667,
      th\u1EF1c_t\u1EBF_actual: 751317,
      target_th\u00E1ng: 18e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2532790
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 15,
      th\u1EF1c_t\u1EBF_actual: 14.8,
      target_th\u00E1ng: 20,
      t\u00EDch_l\u0169y_th\u00E1ng: 14.4
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 1.8,
      target_th\u00E1ng: 2.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 2.3
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 3260,
      th\u1EF1c_t\u1EBF_actual: 3019,
      target_th\u00E1ng: 15e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 13020
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 13e4,
      th\u1EF1c_t\u1EBF_actual: 116246,
      target_th\u00E1ng: 525e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 545828
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 5,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 21
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "instagram",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 14
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 10
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 8
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 7
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 3
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 38,
      th\u1EF1c_t\u1EBF_actual: 38,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 13,
      th\u1EF1c_t\u1EBF_actual: 13.3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 32,
      th\u1EF1c_t\u1EBF_actual: 32.8,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "htv & thvl",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "karofi",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.379,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kang",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.402,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "livotec",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.041,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "sunhouse",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\xF2a ph\xE1t",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kh\xE1c",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.17799999999999994,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 11e7,
      th\u1EF1c_t\u1EBF_actual: 104798291,
      target_th\u00E1ng: 369309113,
      t\u00EDch_l\u0169y_th\u00E1ng: 195733830
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 11e6,
      th\u1EF1c_t\u1EBF_actual: 10600962,
      target_th\u00E1ng: 36875673,
      t\u00EDch_l\u0169y_th\u00E1ng: 20281620
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 4782609,
      th\u1EF1c_t\u1EBF_actual: 5054462,
      target_th\u00E1ng: 10488247,
      t\u00EDch_l\u0169y_th\u00E1ng: 6292948
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 10,
      th\u1EF1c_t\u1EBF_actual: 9.89,
      target_th\u00E1ng: 10,
      t\u00EDch_l\u0169y_th\u00E1ng: 9.7
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 2.3,
      th\u1EF1c_t\u1EBF_actual: 2.1,
      target_th\u00E1ng: 3.5,
      t\u00EDch_l\u0169y_th\u00E1ng: 3.2
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 18e3,
      th\u1EF1c_t\u1EBF_actual: 18292,
      target_th\u00E1ng: 8e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 47087
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 5e5,
      th\u1EF1c_t\u1EBF_actual: 539588,
      target_th\u00E1ng: 25e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 1486224
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 7,
      th\u1EF1c_t\u1EBF_actual: 7,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "e-com",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ooh/led",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "s\u1EA3n xu\u1EA5t \u1EA5n ph\u1EA9m",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video/\u1EA3nh",
      m\u1EE5c_ti\u00EAu_target: 27,
      th\u1EF1c_t\u1EBF_actual: 27,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "ch\u1EC9nh s\u1EEDa content mang t\xEDnh tuy\u1EC7t \u0111\u1ED1i nh\u1EA5t/duy nh\u1EA5t/...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i edited",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 61.8,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 36.8,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 105.7,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "all",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "mtd (th\xE1ng \u0111\u1EBFn nay)",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 3100,
      th\u1EF1c_t\u1EBF_actual: 1947,
      target_th\u00E1ng: 16e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 2747
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 126e3,
      th\u1EF1c_t\u1EBF_actual: 98043,
      target_th\u00E1ng: 56e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 140365
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Clip TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "tvc 60s, 30s, 15s,...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 5,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "all ng\xE0nh",
      k\u00EAnh_channel: "instagram",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 4,
      th\u1EF1c_t\u1EBF_actual: 6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ecom",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 25,
      th\u1EF1c_t\u1EBF_actual: 25.7,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 21,
      th\u1EF1c_t\u1EBF_actual: 21.4,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 45,
      th\u1EF1c_t\u1EBF_actual: 48.6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 46,
      th\u1EF1c_t\u1EBF_actual: 46.4,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Livotec",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 55,
      th\u1EF1c_t\u1EBF_actual: 57.8,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "karofi",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.335,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kang",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.426,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "livotec",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.025,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "sunhouse",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.11,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\xF2a ph\xE1t",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.065,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Brand",
      h\u1EA1ng_m\u1EE5c: "Social Listening",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "kh\xE1c",
      ch\u1EC9_s\u1ED1_metric: "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)",
      m\u1EE5c_ti\u00EAu_target: null,
      th\u1EF1c_t\u1EBF_actual: 0.038999999999999924,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Amount spent (VN\u0110)",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Impressions",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Reach",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "cpm",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "Paid Ads",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook",
      ch\u1EC9_s\u1ED1_metric: "Frequency",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Traffic Organic",
      m\u1EE5c_ti\u00EAu_target: 18e3,
      th\u1EF1c_t\u1EBF_actual: 17643,
      target_th\u00E1ng: 8e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 22510
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "SEO Website",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "Impressions Organic",
      m\u1EE5c_ti\u00EAu_target: 5e5,
      th\u1EF1c_t\u1EBF_actual: 526515,
      target_th\u00E1ng: 25e5,
      t\u00EDch_l\u0169y_th\u00E1ng: 671644
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "facebook (always on, new product lauching, reup)",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt (single post, album post, motion, video, reels...)",
      m\u1EE5c_ti\u00EAu_target: 6,
      th\u1EF1c_t\u1EBF_actual: 6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Social Media",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "instagram",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 6,
      th\u1EF1c_t\u1EBF_actual: 6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "SEO Content",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "Product Page",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng trang s\u1EA3n ph\u1EA9m",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "youtube & website",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 3,
      th\u1EF1c_t\u1EBF_actual: 3,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "e-com",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "h\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi video cho ecom",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "ooh/led",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "s\u1EA3n xu\u1EA5t \u1EA5n ph\u1EA9m",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng video/\u1EA3nh",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Content",
      h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "ch\u1EC9nh s\u1EEDa content mang t\xEDnh tuy\u1EC7t \u0111\u1ED1i nh\u1EA5t/duy nh\u1EA5t/...",
      ch\u1EC9_s\u1ED1_metric: "s\u1ED1 l\u01B0\u1EE3ng b\xE0i edited",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "hcm",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 48,
      th\u1EF1c_t\u1EBF_actual: null,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "han",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 30,
      th\u1EF1c_t\u1EBF_actual: 29,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "03/07-09/07/2026",
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: "weekly",
      brand: "Karofi",
      nh\u00F3m_b\u00E1o_c\u00E1o: "Digital",
      h\u1EA1ng_m\u1EE5c: "TVC",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "can",
      ch\u1EC9_s\u1ED1_metric: "grps",
      m\u1EE5c_ti\u00EAu_target: 80.9,
      th\u1EF1c_t\u1EBF_actual: 80.6,
      target_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    }
  ],
  kol_koc: [
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 (l\u1ECDc n\u01B0\u1EDBc)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (b\u1EBFp t\u1EEB+h\xFAt m\xF9i)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (n\u1ED3i c\u01A1m \u0111i\u1EC7n)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (qu\u1EA1t c\xE2y)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 4,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "kol",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 1,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 (l\u1ECDc n\u01B0\u1EDBc)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (b\u1EBFp t\u1EEB+h\xFAt m\xF9i)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (n\u1ED3i c\u01A1m \u0111i\u1EC7n)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (qu\u1EA1t c\xE2y)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 4,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "kol",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 1,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 (l\u1ECDc n\u01B0\u1EDBc)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 3,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 3
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (b\u1EBFp t\u1EEB+h\xFAt m\xF9i)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (n\u1ED3i c\u01A1m \u0111i\u1EC7n)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 2
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (qu\u1EA1t c\xE2y)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 4,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 1,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 2
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "kol",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 1,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 (l\u1ECDc n\u01B0\u1EDBc)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 3
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (b\u1EBFp t\u1EEB+h\xFAt m\xF9i)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 2 (n\u1ED3i c\u01A1m \u0111i\u1EC7n)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 3,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 2
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (qu\u1EA1t c\xE2y)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 4,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 2
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "koc",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 10,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c: "koc/kol",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3 (\u0111i\u1EC1u h\xF2a)",
      k\u00EAnh_channel: "kol",
      ch\u1EC9_s\u1ED1_metric: "quantity",
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: 1,
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: 0,
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: 1
    }
  ],
  btl_trade: [
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 3,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 39,
      t\u00EDch_l\u0169y_th\u00E1ng: 36
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 7,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 47,
      t\u00EDch_l\u0169y_th\u00E1ng: 34
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 138,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 279,
      t\u00EDch_l\u0169y_th\u00E1ng: 178
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 306,
      t\u00EDch_l\u0169y_th\u00E1ng: 195
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 239,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 492,
      t\u00EDch_l\u0169y_th\u00E1ng: 492
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 320,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1025,
      t\u00EDch_l\u0169y_th\u00E1ng: 997
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 200,
      t\u00EDch_l\u0169y_th\u00E1ng: 200
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "19/06-25/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 4
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 135,
      t\u00EDch_l\u0169y_th\u00E1ng: 92
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 45,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 102,
      t\u00EDch_l\u0169y_th\u00E1ng: 90
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 146,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1033,
      t\u00EDch_l\u0169y_th\u00E1ng: 446
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 98,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 99,
      t\u00EDch_l\u0169y_th\u00E1ng: 89
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 97,
      t\u00EDch_l\u0169y_th\u00E1ng: 81
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 357,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 425,
      t\u00EDch_l\u0169y_th\u00E1ng: 326
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 2028,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4347,
      t\u00EDch_l\u0169y_th\u00E1ng: 2612
    },
    {
      week: "19/06-25/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: "theo y\xEAu c\u1EA7u",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 3,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 39,
      t\u00EDch_l\u0169y_th\u00E1ng: 29
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 7,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 47,
      t\u00EDch_l\u0169y_th\u00E1ng: 33
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 138,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 279,
      t\u00EDch_l\u0169y_th\u00E1ng: 178
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 306,
      t\u00EDch_l\u0169y_th\u00E1ng: 195
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 239,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 492,
      t\u00EDch_l\u0169y_th\u00E1ng: 492
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 320,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1025,
      t\u00EDch_l\u0169y_th\u00E1ng: 997
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 200,
      t\u00EDch_l\u0169y_th\u00E1ng: 200
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "12/06-18/06/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: "theo y\xEAu c\u1EA7u",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 4
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 135,
      t\u00EDch_l\u0169y_th\u00E1ng: 92
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 45,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 102,
      t\u00EDch_l\u0169y_th\u00E1ng: 90
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 146,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1033,
      t\u00EDch_l\u0169y_th\u00E1ng: 446
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 98,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 99,
      t\u00EDch_l\u0169y_th\u00E1ng: 58
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 97,
      t\u00EDch_l\u0169y_th\u00E1ng: 66
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 357,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 425,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 2028,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4347,
      t\u00EDch_l\u0169y_th\u00E1ng: 1625
    },
    {
      week: "12/06-18/06/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: "theo y\xEAu c\u1EA7u",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 36,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 43,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 22,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 279,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "mln mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "mln gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 492,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 997,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "b\xECnh n\xF3ng mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "b\xECnh n\xF3ng gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "b\u1ED9 posm s\u1EA3n ph\u1EA9m (toper, woblle...)",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2600,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 200,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "h\u1ED9i ngh\u1ECB kh\xE1ch h\xE0ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 122,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 13,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 119,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 119,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 841,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 268,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up tr\u01B0ng b\xE0y",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "b\u1ED9 posm s\u1EA3n ph\u1EA9m (toper, woblle...)",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1800,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4100,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 760,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 440,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 90,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 90,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ph\u00E2n_lo\u1EA1i: "qu\xE0 gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1e4,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "h\u1ED9i ngh\u1ECB kh\xE1ch h\xE0ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: null
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 101,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 116,
      t\u00EDch_l\u0169y_th\u00E1ng: 20
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 122,
      t\u00EDch_l\u0169y_th\u00E1ng: 26
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 425,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 449,
      t\u00EDch_l\u0169y_th\u00E1ng: 99
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4347,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 3621,
      t\u00EDch_l\u0169y_th\u00E1ng: 1735
    },
    {
      week: "26/06-02/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ngh\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 1
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 36,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 10
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 43,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4,
      t\u00EDch_l\u0169y_th\u00E1ng: 10
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 22,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 16
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 279,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "mln mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "mln gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 492,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 997,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "b\xECnh n\xF3ng mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "b\xECnh n\xF3ng gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "b\u1ED9 posm s\u1EA3n ph\u1EA9m (toper, woblle...)",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2600,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 200,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "h\u1ED9i ngh\u1ECB kh\xE1ch h\xE0ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 10,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 122,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 41,
      t\u00EDch_l\u0169y_th\u00E1ng: 4
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: null,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 55,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 23,
      t\u00EDch_l\u0169y_th\u00E1ng: 7
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 15,
      t\u00EDch_l\u0169y_th\u00E1ng: 2
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 119,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 135,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 841,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 307,
      t\u00EDch_l\u0169y_th\u00E1ng: 146
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 5e3,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up tr\u01B0ng b\xE0y",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "b\u1ED9 posm s\u1EA3n ph\u1EA9m (toper, woblle...)",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 400,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "m\xE1y l\u1ECDc n\u01B0\u1EDBc",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 760,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 440,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 90,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 90,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "kh\xE1c",
      ph\u00E2n_lo\u1EA1i: "qu\xE0 gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1e4,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "h\u1ED9i ngh\u1ECB kh\xE1ch h\xE0ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 1,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 2,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 0,
      t\u00EDch_l\u0169y_th\u00E1ng: 0
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 101,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 116,
      t\u00EDch_l\u0169y_th\u00E1ng: 44
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 106,
      t\u00EDch_l\u0169y_th\u00E1ng: 34
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 425,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 727,
      t\u00EDch_l\u0169y_th\u00E1ng: 437
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4347,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 4724,
      t\u00EDch_l\u0169y_th\u00E1ng: 3899
    },
    {
      week: "03/07-09/07/2026",
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ngh\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: 3,
      t\u00EDch_l\u0169y_th\u00E1ng: 3
    }
  ],
  monthly_ooh_pr: [
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 & ng\xE0nh 3",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 2676,
      th\u1EF1c_t\u1EBF_actual: 2856
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 & ng\xE0nh 3",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 10150,
      th\u1EF1c_t\u1EBF_actual: 10794
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 & ng\xE0nh 3",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1 & ng\xE0nh 3",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 7,
      th\u1EF1c_t\u1EBF_actual: 7
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "views",
      m\u1EE5c_ti\u00EAu_target: 2e4,
      th\u1EF1c_t\u1EBF_actual: 20858
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 2,
      th\u1EF1c_t\u1EBF_actual: 2
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 3",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "views",
      m\u1EE5c_ti\u00EAu_target: 1e4,
      th\u1EF1c_t\u1EBF_actual: 12099
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "all (branding)",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 1,
      th\u1EF1c_t\u1EBF_actual: 1
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "PR - b\xE1o ch\xED",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "views",
      m\u1EE5c_ti\u00EAu_target: 2e4,
      th\u1EF1c_t\u1EBF_actual: 21948
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 3100,
      th\u1EF1c_t\u1EBF_actual: 3280
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 10150,
      th\u1EF1c_t\u1EBF_actual: 10794
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 26,
      th\u1EF1c_t\u1EBF_actual: 26
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 26,
      th\u1EF1c_t\u1EBF_actual: 26
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 18,
      th\u1EF1c_t\u1EBF_actual: 18
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 245,
      th\u1EF1c_t\u1EBF_actual: 245
    },
    {
      week: "12/06-18/06/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "2026-05-01",
      h\u1EA1ng_m\u1EE5c: "ooh",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "ng\xE0nh 1",
      k\u00EAnh_channel: "pano",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 31,
      th\u1EF1c_t\u1EBF_actual: 31
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "views",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 2676,
      th\u1EF1c_t\u1EBF_actual: 5445
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 10150,
      th\u1EF1c_t\u1EBF_actual: 19640
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Livotec",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 7,
      th\u1EF1c_t\u1EBF_actual: 7
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "Quantity",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "b\xE1o ch\xED",
      ch\u1EC9_s\u1ED1_metric: "views",
      m\u1EE5c_ti\u00EAu_target: 0,
      th\u1EF1c_t\u1EBF_actual: 0
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 3100,
      th\u1EF1c_t\u1EBF_actual: 5445
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "lcd building",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 10150,
      th\u1EF1c_t\u1EBF_actual: 19640
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led cities",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 12,
      th\u1EF1c_t\u1EBF_actual: 12
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 108,
      th\u1EF1c_t\u1EBF_actual: 108
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "led airport",
      ch\u1EC9_s\u1ED1_metric: "screen",
      m\u1EE5c_ti\u00EAu_target: 201,
      th\u1EF1c_t\u1EBF_actual: 201
    },
    {
      week: "03/07-09/07/2026",
      th\u00E1ng_b\u00E1o_c\u00E1o: "",
      h\u1EA1ng_m\u1EE5c: "",
      brand: "Karofi",
      ng\u00E0nh_h\u00E0ng: "",
      k\u00EAnh_channel: "pano",
      ch\u1EC9_s\u1ED1_metric: "location",
      m\u1EE5c_ti\u00EAu_target: 28,
      th\u1EF1c_t\u1EBF_actual: 28
    }
  ],
  btl_trade_monthly: [
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 3
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 7
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 138
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 239
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 320
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 45
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 146
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 98
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 40
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 357
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 2028
    },
    {
      month: 5,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: "theo y\xEAu c\u1EA7u",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 5,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: "theo y\xEAu c\u1EA7u",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: null
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 36
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 43
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "\xF4/d\xF9",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 279
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 492
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "mock up",
      ph\u00E2n_lo\u1EA1i: "\u0111i\u1EC1u h\xF2a gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 997
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "t\xE0i li\u1EC7u b\xE1n h\xE0ng (catalog, brochure...)",
      ph\u00E2n_lo\u1EA1i: "all",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "b\u1ED9",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 200
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 0
    },
    {
      month: 6,
      year: 2026,
      brand: "Livotec",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo y\xEAu c\u1EA7u",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "bi\u1EC3n b\u1EA3ng",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 122
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "qu\u1EA7y k\u1EC7",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "c\u1ED5ng h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 119
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "posm m\u1EB7t ti\u1EC1n",
      ph\u00E2n_lo\u1EA1i: "r\u1ED1i h\u01A1i",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "c\xE1i",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 841
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 760
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 440
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "POSM",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "\u0111\u1ED3ng ph\u1EE5c",
      ph\u00E2n_lo\u1EA1i: "l\u1ECDc t\u1ED5ng",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "chi\u1EBFc",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 90
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "activation",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "event",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "workshop",
      ph\u00E2n_lo\u1EA1i: "mt/gt",
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 s\u1EF1 ki\u1EC7n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 101
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ki\u1EC3m tra th\u1EF1c t\u1EBF",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 102
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "mt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 425
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ki\u1EC3m so\xE1t ha \u0111i\u1EC3m b\xE1n",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh",
      ph\u00E2n_lo\u1EA1i: "gt",
      t\u1EA7n_su\u1EA5t: "th\xE1ng",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "\u0111i\u1EC3m b\xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 4347
    },
    {
      month: 6,
      year: 2026,
      brand: "Karofi",
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: "ngh\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng",
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: "d\u1EF1 \xE1n nghi\xEAn c\u1EE9u",
      ph\u00E2n_lo\u1EA1i: null,
      t\u1EA7n_su\u1EA5t: "theo d\u1EF1 \xE1n",
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: "s\u1ED1 d\u1EF1 \xE1n",
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: 1
    }
  ],
  comments: {
    "26/06-02/07/2026": {
      Livotec: {
        evaluation: "\u0110\xE2y l\xE0 tu\u1EA7n ch\u1ED1t th\xE1ng b\xF9ng n\u1ED5 c\u1EE7a Livotec khi ho\xE0n th\xE0nh h\xE0ng lo\u1EA1t h\u1EA1ng m\u1EE5c l\u1EDBn: Paid Ads ch\u1EA1y n\u01B0\u1EDBc r\xFAt v\u1EC1 \u0111\xEDch th\xE1ng, m\u1EA3ng KOC/KOL b\xF9ng n\u1ED5 s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt, v\xE0 m\u1EA3ng BTL Retail th\u1EF1c hi\u1EC7n nghi\u1EC7m thu kh\u1ED1i l\u01B0\u1EE3ng POSM kh\u1ED5ng l\u1ED3.  ",
        proposals: "** B\u01B0\u1EDBc sang th\xE1ng m\u1EDBi, c\u1EA7n r\xE0 so\xE1t l\u1EA1i t\u1EC7p KOC v\xE0 t\u1ED1i \u01B0u l\u1EA1i chi ph\xED CPM qu\u1EA3ng c\xE1o c\u1EE7a Facebook (do m\u1ED9t s\u1ED1 ng\xE0nh b\u1EAFt \u0111\u1EA7u c\xF3 xu h\u01B0\u1EDBng CPM t\u0103ng nh\u1EB9). \n** L\xEAn k\u1EBF ho\u1EA1ch kh\u1EA3o s\xE1t h\xECnh \u1EA3nh \u0111i\u1EC3m b\xE1n sau \u0111\u1EE3t ph\u1EE7 POSM l\u1EDBn.  ",
        categories: {
          sov: "Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn ng\xE0nh l\u1ECDc n\u01B0\u1EDBc c\u1EE7a Livotec t\u0103ng nh\u1EB9 l\xEAn m\u1EE9c 4.1% (so v\u1EDBi m\u1EE9c 2.8% c\u1EE7a tu\u1EA7n tr\u01B0\u1EDBc) do c\xF3 th\xEAm 5 b\xE0i review KOL/KOC \u0111\u01B0\u1EE3c on air",
          kol_koc: "C\xF3 s\u1EF1 b\u1EE9t ph\xE1 l\u1EDBn khi l\xEAn s\xF3ng th\xE0nh c\xF4ng 3 b\xE0i KOC M\xE1y l\u1ECDc n\u01B0\u1EDBc, 1 b\xE0i KOC N\u1ED3i c\u01A1m \u0111i\u1EC7n v\xE0 1 b\xE0i KOC Qu\u1EA1t c\xE2y.",
          content: "Facebook ch\u1EA1y v\u01B0\u1EE3t t\u1EA3i \u0111\u1EA1t 5 b\xE0i vi\u1EBFt. Nghi\u1EC7m thu 2 video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m m\u1EDBi cho E-com cho c\u1EA3 3 ng\xE0nh h\xE0ng.",
          tvc: "Ch\u1EC9 s\u1ED1 GRPs th\u1EF1c t\u1EBF ph\xE1t s\xF3ng tu\u1EA7n n\xE0y ghi nh\u1EADn s\u1EF1 v\u01B0\u1EE3t tr\u1ED9i \u1EDF c\xE1c k\xEAnh/khu v\u1EF1c ch\xEDnh:  \n- Ng\xE0nh 1: K\xEAnh HCM \u0111\u1EA1t 21.7 GRPs (target 21 GRPs) v\xE0 38 GRPs (target 38 GRPs); K\xEAnh HAN \u0111\u1EA1t 13.3 GRPs (target 13 GRPs); K\xEAnh CAN \u0111\u1EA1t 32.8 GRPs (target 32 GRPs).  \n- Ng\xE0nh 3: K\xEAnh CAN \u0111\u1EA1t 57.8 GRPs (v\u01B0\u1EE3t target 55 GRPs)",
          pr: "",
          ooh: "",
          paid_ads: "\u0110\u1EA1t ho\u1EB7c su\xFDt so\xE1t \u0111\u1EA1t m\u1EE5c ti\xEAu chi ti\xEAu tu\u1EA7n. L\u01B0\u1EE3ng Reach thu v\u1EC1 tr\xEAn t\u1EA5t c\u1EA3 c\xE1c k\xEAnh Facebook, TikTok, Youtube c\u1EE7a c\xE1c ng\xE0nh h\xE0ng \u0111\u1EC1u v\u01B0\u1EE3t k\u1EBF ho\u1EA1ch tu\u1EA7n nh\u1EDD t\u1ED1i \u01B0u t\u1EA7n su\u1EA5t (Frequency)",
          seo: "L\u01B0\u1EE3ng Organic Traffic MTD l\u0169y k\u1EBF \u0111\u1EA1t 3,019 l\u01B0\u1EE3t (g\u1EA7n b\xE1m s\xE1t target 3,260 l\u01B0\u1EE3t). L\u01B0\u1EE3ng Organic Impressions tu\u1EA7n \u0111\u1EA1t 116,246 l\u01B0\u1EE3t (\u0111\u1EA1t 89.4% so v\u1EDBi target tu\u1EA7n 130,000 l\u01B0\u1EE3t). L\u0169y k\u1EBF hi\u1EC3n th\u1ECB th\xE1ng \u0111\u1EA1t 545,828 l\u01B0\u1EE3t (v\u01B0\u1EE3t target th\xE1ng 525,000)",
          btl_trade: "T\u1ED5ng l\u1EF1c nghi\u1EC7m thu POSM cu\u1ED1i th\xE1ng 6 v\u1EDBi s\u1ED1 l\u01B0\u1EE3ng \u1EA5n t\u01B0\u1EE3ng: 36 bi\u1EC3n b\u1EA3ng GT, 43 qu\u1EA7y k\u1EC7 GT, 279 \xF4 d\xF9 m\u1EB7t ti\u1EC1n, 492 mock up \u0111i\u1EC1u h\xF2a MT v\xE0 997 mock up \u0111i\u1EC1u h\xF2a GT. Ho\xE0n th\xE0nh 4 d\u1EF1 \xE1n nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng \u0111\xFAng h\u1EA1n"
        }
      },
      Karofi: {
        evaluation: "Karofi kh\xE9p l\u1EA1i tu\u1EA7n cu\u1ED1i th\xE1ng v\u1EDBi s\u1EF1 t\u0103ng tr\u01B0\u1EDFng tr\u1EDF l\u1EA1i v\u1EC1 th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (SOV t\u0103ng l\xEAn 37.9%). Qu\u1EA3ng c\xE1o Paid Ads ho\u1EA1t \u0111\u1ED9ng v\u1EDBi c\xF4ng su\u1EA5t t\u1ED1i \u0111a. \u0110i\u1EC3m nh\u1EA5n l\u1EDBn nh\u1EA5t l\xE0 vi\u1EC7c b\xF9ng n\u1ED5 ph\xE2n ph\u1ED1i \u0111\u1ED3ng ph\u1EE5c v\xE0 tri\u1EC3n khai th\xE0nh c\xF4ng c\xE1c s\u1EF1 ki\u1EC7n Activation/Workshop. \u0110\u1EB7c bi\u1EC7t, \u0111\xE2y l\xE0 tu\u1EA7n \u0111\u1EA7u ti\xEAn ghi nh\u1EADn s\u1ED1 li\u1EC7u TVC (GRPs) th\u1EF1c t\u1EBF \u0111\u1ED5 v\u1EC1.  ",
        proposals: "** Duy tr\xEC v\xE0 t\u1ED1i \u01B0u h\xF3a c\xE1c khung gi\u1EDD ch\u1EA1y TVC \u0111\u1EC3 \u0111\u1EA9y ch\u1EC9 s\u1ED1 GRPs theo k\u1EBF ho\u1EA1ch tri\u1EC3n khai. \n** Ti\u1EBFp t\u1EE5c ki\u1EC3m so\xE1t v\xE0 duy tr\xEC ch\u1EA5t l\u01B0\u1EE3ng tr\u01B0ng b\xE0y t\u1EA1i c\xE1c \u0111i\u1EC3m b\xE1n GT sau khi ghi nh\u1EADn l\u01B0\u1EE3ng ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh t\u0103ng \u0111\u1ED9t bi\u1EBFn.  ",
        categories: {
          sov: "Ch\u1EC9 s\u1ED1 SOV c\u1EE7a Karofi \u0111\u1EA1t 37.9%, t\u0103ng tr\u01B0\u1EDFng tr\u1EDF l\u1EA1i sau tu\u1EA7n gi\u1EA3m \u0111i\u1EC3m tr\u01B0\u1EDBc \u0111\xF3 (35.9%) v\xE0 b\xE1m r\u1EA5t s\xE1t \u0111\u1ED1i th\u1EE7 d\u1EABn \u0111\u1EA7u Kangaroo (40.2%).  ",
          kol_koc: "",
          content: "\u0111\u1EA9y m\u1EA1nh truy\u1EC1n th\xF4ng v\u1EDBi 7 b\xE0i vi\u1EBFt Facebook lu\xF4n \u1ED5n \u0111\u1ECBnh. Ho\xE0n th\xE0nh s\u1EA3n xu\u1EA5t 27 video/\u1EA3nh ph\u1EE5c v\u1EE5 k\xEAnh OOH/LED.",
          tvc: "Tu\u1EA7n ch\u1ED1t th\xE1ng ghi nh\u1EADn ch\u1EC9 s\u1ED1 GRPs b\xF9ng n\u1ED5, \u0111\u1EB7c bi\u1EC7t l\xE0 t\u1EA1i khu v\u1EF1c mi\u1EC1n T\xE2y:  \n- K\xEAnh C\u1EA7n Th\u01A1 (CAN) d\u1EABn \u0111\u1EA7u v\u1EDBi 105.7 GRPs.  \n- K\xEAnh HCM \u0111\u1EA1t 61.8 GRPs.  \n- K\xEAnh H\xE0 N\u1ED9i (HAN) \u0111\u1EA1t 36.8 GRPs. \nNh\u1EADn x\xE9t: Chi\u1EBFn d\u1ECBch TVC cu\u1ED1i th\xE1ng 6 c\u1EE7a Karofi \u0111\xE3 \u0111\u1EA1t \u0111\u1ED9 ph\u1EE7 s\xF3ng r\u1ED9ng r\xE3i tr\xEAn h\u1EC7 th\u1ED1ng truy\u1EC1n h\xECnh tr\u1ECDng \u0111i\u1EC3m. ",
          pr: "",
          ooh: "",
          paid_ads: "Ch\u1EA1y n\u01B0\u1EDBc r\xFAt v\u1EDBi ng\xE2n s\xE1ch l\u1EDBn ~104.7 tri\u1EC7u VN\u0110 trong tu\u1EA7n, mang v\u1EC1 h\u01A1n 10.6M Impressions v\xE0 h\u01A1n 5M Reach (v\u01B0\u1EE3t xa m\u1EE5c ti\xEAu 4.78M Reach). CPM ki\u1EC3m so\xE1t r\u1EA5t t\u1ED1t \u1EDF m\u1EE9c 9.89.",
          seo: "M\u1EA3ng SEO ti\u1EBFp t\u1EE5c duy tr\xEC phong \u0111\u1ED9 \u1EA5n t\u01B0\u1EE3ng. Organic Traffic tu\u1EA7n \u0111\u1EA1t 18,292 l\u01B0\u1EE3t (v\u01B0\u1EE3t target tu\u1EA7n 18,000 l\u01B0\u1EE3t). Organic Impressions \u0111\u1EA1t 539,588 l\u01B0\u1EE3t (v\u01B0\u1EE3t target tu\u1EA7n 500,000 l\u01B0\u1EE3t).",
          btl_trade: "T\u1ED5ng k\u1EBFt th\u1EF1c hi\u1EC7n cua th\xE1ng 6 ghi nh\u1EADn: \n* S\u1EF1 ki\u1EC7n: T\u1ED5 ch\u1EE9c th\xE0nh c\xF4ng 1 s\u1EF1 ki\u1EC7n Activation v\xE0 1 Workshop \u0111\xFAng ti\u1EBFn \u0111\u1ED9.  \n* POSM: Ph\xE2n ph\u1ED1i s\u1ED1 l\u01B0\u1EE3ng l\u1EDBn trang thi\u1EBFt b\u1ECB bao g\u1ED3m 122 bi\u1EC3n b\u1EA3ng, 102 qu\u1EA7y k\u1EC7, 119 c\u1ED5ng h\u01A1i, 841 r\u1ED1i h\u01A1i v\xE0 t\u1ED5ng c\u1ED9ng 1,290 chi\u1EBFc \u0111\u1ED3ng ph\u1EE5c cho c\xE1c \u0111\u1EA1i l\xFD MT/GT/L\u1ECDc t\u1ED5ng.  \n* Ki\u1EC3m so\xE1t h\xECnh \u1EA3nh: Ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh online cho k\xEAnh GT t\u0103ng \u0111\u1ED9t bi\u1EBFn v\u01B0\u1EE3t k\u1EBF ho\u1EA1ch, \u0111\u1EA1t 4,347 \u0111i\u1EC3m b\xE1n. Ho\xE0n th\xE0nh 1 d\u1EF1 \xE1n nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng"
        }
      }
    },
    "03/07-09/07/2026": {
      Livotec: {
        evaluation: "Tu\u1EA7n \u0111\u1EA7u th\xE1ng 7 c\u1EE7a Livotec ghi nh\u1EADn s\u1EF1 chuy\u1EC3n h\u01B0\u1EDBng t\u1EADp trung ng\xE2n s\xE1ch v\xE0 ngu\u1ED3n l\u1EF1c. \n** M\u1EA3ng Paid Ads t\u1EA1m d\u1EEBng ch\u1EA1y trong tu\u1EA7n n\xE0y do review l\u1EA1i k\u1EBF ho\u1EA1ch Qu\xFD 3. \n** \u0110i\u1EC3m s\xE1ng n\u1EB1m \u1EDF vi\u1EC7c duy tr\xEC hi\u1EC7u su\u1EA5t ch\u1EA1y TVC tr\xEAn truy\u1EC1n h\xECnh r\u1EA5t \u1EA5n t\u01B0\u1EE3ng v\u01B0\u1EE3t ch\u1EC9 ti\xEAu GRPs, \u0111\u1ED3ng th\u1EDDi m\u1EA3ng Content v\xE0 SEO Website ti\u1EBFp t\u1EE5c s\u1EA3n xu\u1EA5t n\u1ED9i dung \u0111\u1EC1u \u0111\u1EB7n.  \n\n\u0110i\u1EC3m c\u1EA7n c\u1EA3i thi\u1EC7n: SEO hi\u1EC7n c\xF2n m\u1EDBi, \u0111ang giai \u0111o\u1EA1n chuy\u1EC3n giao web c\u0169 -> web m\u1EDBi n\xEAn traffic Organic c\xF2n th\u1EA5p, ch\u01B0a t\u1EF1 d\u1EE9ng v\u1EEFng, c\xF2n ph\u1EE5 thu\u1ED9c v\xE0o traffic Paid ads.",
        proposals: "T\xE1i kh\u1EDFi \u0111\u1ED9ng v\xE0 t\u1ED1i \u01B0u h\xF3a c\xE1c chi\u1EBFn d\u1ECBch Paid Ads tr\xEAn c\xE1c k\xEAnh Facebook/TikTok cho th\xE1ng m\u1EDBi. ngay khi k\u1EBF ho\u1EA1ch \u0111\u01B0\u1EE3c ph\xEA duy\u1EC7t.\n** Nhi\u1EC7m v\u1EE5 l\xE2u d\xE0i: C\u1EA7n \u0111\u1EA9y m\u1EA1nh t\u1ED1i \u01B0u SEO Website (\u0111\u1EB7c bi\u1EC7t l\xE0 Organic Traffic) \u0111\u1EC3 t\u1EF1 \u0111\u1EE9ng v\u1EEFng kh\xF4ng ph\u1EE5 thu\u1ED9c traffic Paid Ads",
        categories: {
          sov: "Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (SOV) c\u1EE7a Livotec hi\u1EC7n t\u1EA1i ch\u1EC9 \u0111\u1EA1t 2.8%, \u0111\u1EE9ng th\u1EE9 5 trong nh\xF3m c\xE1c th\u01B0\u01A1ng hi\u1EC7u \u0111\u01B0\u1EE3c \u0111o l\u01B0\u1EDDng, C\u1EA7n tri\u1EC3n khai c\xE1c mini-game ho\u1EB7c ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn c\u1ED9ng \u0111\u1ED3ng \u0111\u1EC3 k\xEDch ho\u1EA1t l\u01B0\u1EE3ng t\u01B0\u01A1ng t\xE1c t\u1EF1 nhi\xEAn l\u1EDBn h\u01A1n.",
          kol_koc: "Tu\u1EA7n n\xE0y ghi nh\u1EADn 0 k\u1EBFt qu\u1EA3 on air, do c\xE1c KOL/KOC \u0111ang trong qu\xE1 tr\xECnh s\u1EA3n xu\u1EA5t",
          content: "Ho\xE0n th\xE0nh xu\u1EA5t s\u1EAFc ch\u1EC9 ti\xEAu Social Media v\u1EDBi 5 b\xE0i Facebook (v\u01B0\u1EE3t target 4) v\xE0 6 b\xE0i Instagram (v\u01B0\u1EE3t target 4). \u0110\u1EA1t 100% KPI nghi\u1EC7m thu 1 Clip TVC Ng\xE0nh 3, 3 b\xE0i SEO Content (Ng\xE0nh 1 v\xE0 Ng\xE0nh 3), 2 trang s\u1EA3n ph\u1EA9m Ng\xE0nh 3 v\xE0 1 video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m Ng\xE0nh 1.",
          tvc: "Ho\u1EA1t \u0111\u1ED9ng ph\xE1t s\xF3ng TVC di\u1EC5n ra r\u1EA5t hi\u1EC7u qu\u1EA3, v\u01B0\u1EE3t m\u1EE5c ti\xEAu GRPs tr\xEAn t\u1EA5t c\u1EA3 c\xE1c k\xEAnh/khu v\u1EF1c:  \n** Ng\xE0nh 1: K\xEAnh HCM \u0111\u1EA1t 23 GRPs (v\u01B0\u1EE3t target 20) v\xE0 25.7 GRPs (v\u01B0\u1EE3t target 25); k\xEAnh HAN \u0111\u1EA1t 21.4 GRPs (v\u01B0\u1EE3t target 21); k\xEAnh CAN \u0111\u1EA1t 48.6 GRPs (v\u01B0\u1EE3t target 45).  \n** Ng\xE0nh 3: K\xEAnh CAN \u0111\u1EA1t 46.4 GRPs (v\u01B0\u1EE3t target 46).",
          pr: "B\xE1o c\xE1o PR th\xE1ng 6 ghi nh\u1EADn ho\xE0n th\xE0nh 2 b\xE0i b\xE1o ch\xED Ng\xE0nh 3 (12,099 views) v\xE0 1 b\xE0i b\xE1o ch\xED Ng\xE0nh 1 (15,062 views).",
          ooh: "B\xE1o c\xE1o t\u1ED5ng k\u1EBFt OOH th\xE1ng 6 v\u01B0\u1EE3t k\u1EF3 v\u1ECDng \u1EDF k\xEAnh LCD Building khi \u0111\u1EA1t 5,445 locations (target 2,676) v\xE0 19,640 screens (target 10,150). C\xE1c k\xEAnh LED Cities (12 locations) v\xE0 LED Airport (7 locations) \u0111\u1EC1u ho\xE0n th\xE0nh 100% target.",
          paid_ads: "T\u1EA1m th\u1EDDi kh\xF4ng ph\xE1t sinh chi ti\xEAu v\xE0 ch\u1EC9 s\u1ED1 (Actual/Target = 0) tr\xEAn k\xEAnh Facebook/Tiktok/Google do \u0111ang ch\u1EDD ph\xEA duy\u1EC7t k\u1EBF h\u1ECDach",
          seo: "SEO traffic gi\u1EA3m 1/3 so v\u1EDBi tu\u1EA7n tr\u01B0\u1EDBc. C\u1EA7n ti\u1EBFp t\u1EE5c \u0111\u1EA9y m\u1EA1nh c\xE1c tuy\u1EBFn b\xE0i v\xE0 backlink \u0111\u1EC3 t\u0103ng hi\u1EC7u qu\u1EA3 SEO. M\u1EE5c ti\xEAu l\xE2u d\xE0i c\xF3 th\u1EC3 t\u1EF1 \u0111\u1EE9ng v\u1EEFng m\xE0 kh\xF4ng ph\u1EE5 thu\u1ED9c Paid Ads traffic",
          btl_trade: "D\u1EEF li\u1EC7u t\xEDch l\u0169y th\xE1ng 7 b\u1EAFt \u0111\u1EA7u ghi nh\u1EADn l\u1EA1i c\xE1c ch\u1EC9 s\u1ED1 BTL Retail m\u1EDBi sau \u0111\u1EE3t t\u1ED5ng l\u1EF1c ch\u1ED1t th\xE1ng 6."
        }
      },
      Karofi: {
        evaluation: "Tu\u1EA7n 03/07 - 09/07/2026 \u0111\xE1nh d\u1EA5u giai \u0111o\u1EA1n duy tr\xEC \u1ED5n \u0111\u1ECBnh truy\u1EC1n th\xF4ng c\u1EE7a Karofi. Ch\u1EC9 s\u1ED1 th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (SOV) \u0111\u1EA1t 33.5%. M\u1EA3ng TVC tr\xEAn truy\u1EC1n h\xECnh \u0111\u1EA1t ch\u1EC9 s\u1ED1 GRPs c\u1EF1c k\u1EF3 t\u1ED1t t\u1EA1i khu v\u1EF1c HCM v\xE0 C\u1EA7n Th\u01A1. C\xE1c h\u1EA1ng m\u1EE5c s\u1EA3n xu\u1EA5t n\u1ED9i dung Content, SEO Website v\xE0 Video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m \u0111\u1EC1u \u0111\u1EA1t 100% m\u1EE5c ti\xEAu tu\u1EA7n.  ",
        proposals: "** C\u1EA7n c\xF3 th\xEAm c\xE1c tuy\u1EBFn n\u1ED9i dung t\u1EA1o th\u1EA3o lu\u1EADn n\u1ED5i b\u1EADt tr\xEAn Social \u0111\u1EC3 gia t\u0103ng l\u1EA1i ch\u1EC9 s\u1ED1 SOV c\u1EA1nh tranh.  \n** Ti\u1EBFp t\u1EE5c theo d\xF5i s\xE1t v\xE0 duy tr\xEC phong \u0111\u1ED9 ph\xE1t s\xF3ng TVC t\u1EA1i th\u1ECB tr\u01B0\u1EDDng H\xE0 N\u1ED9i \u0111\u1EC3 v\u01B0\u1EE3t m\u1EE9c Target.  \n** T\xE1i kh\u1EDFi ch\u1EA1y c\xE1c chi\u1EBFn d\u1ECBch Paid Ads cho k\u1EBF ho\u1EA1ch th\xE1ng m\u1EDBi ngay khi k\u1EBF ho\u1EA1ch \u0111\u01B0\u1EE3c ph\xEA duy\u1EC7t",
        categories: {
          sov: "Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn c\u1EE7a Karofi trong tu\u1EA7n \u0111\u1EA1t 33.5%. M\u1EB7c d\xF9 ti\u1EBFp t\u1EE5c duy tr\xEC v\u1ECB th\u1EBF top \u0111\u1EA7u tr\xEAn th\u1ECB tr\u01B0\u1EDDng, Karofi v\u1EABn \u0111ang \u0111\u1EE9ng sau th\u01B0\u01A1ng hi\u1EC7u Kangaroo (x\u1EBFp th\u1EE9 1 v\u1EDBi 42.6%). C\xE1c \u0111\u1ED1i th\u1EE7 kh\xE1c nh\u01B0 Sunhouse (11%) v\xE0 H\xF2a Ph\xE1t (6.5%) chi\u1EBFm th\u1ECB ph\u1EA7n nh\u1ECF h\u01A1n.",
          kol_koc: "",
          content: "Ho\xE0n th\xE0nh 100% k\u1EBF ho\u1EA1ch \u0111\u1EC1 ra v\u1EDBi 6 b\xE0i Facebook, 6 b\xE0i Instagram, 1 b\xE0i SEO Content, 2 trang s\u1EA3n ph\u1EA9m, 3 video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m v\xE0 1 video h\u1ED7 tr\u1EE3 E-com",
          tvc: "Ph\xE1t s\xF3ng TVC \u0111\u1EA1t k\u1EBFt qu\u1EA3 \u1EA5n t\u01B0\u1EE3ng:  \n- K\xEAnh HCM \u0111\u1EA1t 49.3 GRPs (v\u01B0\u1EE3t target 48).  \n- K\xEAnh C\u1EA7n Th\u01A1 (CAN) \u0111\u1EA1t 80.6 GRPs (b\xE1m s\xE1t target 80.9).  \n- K\xEAnh H\xE0 N\u1ED9i (HAN) \u0111\u1EA1t 29 GRPs (su\xFDt so\xE1t target 30).",
          pr: "",
          ooh: "B\xE1o c\xE1o OOH th\xE1ng 6 \u0111\u1EA1t hi\u1EC7u qu\u1EA3 hi\u1EC3n th\u1ECB v\u01B0\u1EE3t b\u1EADc \u1EDF k\xEAnh LCD Building v\u1EDBi 5,445 locations (target 3,100) v\xE0 19,640 screens (target 10,150). K\xEAnh LED Airport (108 locations, 201 screens), LED Cities (12 locations) v\xE0 Pano (28 locations) \u0111\u1EC1u ho\xE0n th\xE0nh 100% ch\u1EC9 ti\xEAu",
          paid_ads: "Ch\u01B0a ph\xE1t s\xEDnh s\u1ED1 li\u1EC7u do review l\u1EA1i plan Qu\xFD 3 v\xE0 ch\u1EDD ph\xEA duy\u1EC7t l\u1EA1i",
          seo: "M\u1EA3ng SEO c\u1EE7a Karofi duy tr\xEC \u0111\u1ED9 \u1ED5n \u0111\u1ECBnh r\u1EA5t cao. Organic Traffic \u0111\u1EA1t 17,643 l\u01B0\u1EE3t (b\xE1m s\xE1t 98% m\u1EE5c ti\xEAu 18,000 l\u01B0\u1EE3t/tu\u1EA7n). Organic Impressions b\xF9ng n\u1ED5 \u0111\u1EA1t 526,515 l\u01B0\u1EE3t (v\u01B0\u1EE3t ch\u1EC9 ti\xEAu tu\u1EA7n 500,000).",
          btl_trade: "Ti\u1EBFp t\u1EE5c tri\u1EC3n khai k\u1EBF ho\u1EA1ch BTL Retail theo ti\u1EBFn \u0111\u1ED9 th\xE1ng m\u1EDBi."
        }
      }
    },
    "12/06-18/06/2026": {
      Livotec: {
        evaluation: "Tu\u1EA7n n\xE0y ghi nh\u1EADn c\xE1c ho\u1EA1t \u0111\u1ED9ng Digital, Content, PR v\xE0 OOH \u0111\u1EC1u ch\u1EA1y kh\xE1 \u1ED5n \u0111\u1ECBnh v\xE0 b\xE1m s\xE1t ti\u1EBFn \u0111\u1ED9 k\u1EBF ho\u1EA1ch. Ng\xE2n s\xE1ch qu\u1EA3ng c\xE1o \u0111\u01B0\u1EE3c t\u1ED1i \u01B0u hi\u1EC7u qu\u1EA3 v\u1EDBi m\u1EE9c CPM duy tr\xEC th\u1EA5p. ",
        proposals: "** T\u0103ng t\u1ED1c tri\u1EC3n khai m\u1EA3ng KOC/KOL cho c\xE1c ng\xE0nh h\xE0ng ch\u01B0a \u0111\u1EA1t \u0111\u1EE7 s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt.\n** Duy tr\xEC ph\xE2n b\u1ED5 ng\xE2n s\xE1ch t\u1ED1i \u01B0u tr\xEAn Facebook v\xE0 TikTok.  ",
        categories: {
          sov: "Ph\u1EA7n th\u1EA3o lu\u1EADn (SOV) c\u1EE7a Livotec hi\u1EC7n t\u1EA1i ch\u1EC9 \u0111\u1EA1t 2,8%, \u0111\u1EE9ng th\u1EE9 5 trong nh\xF3m c\xE1c th\u01B0\u01A1ng hi\u1EC7u \u0111\u01B0\u1EE3c \u0111o chuy\u1EC3n \u0111\u1ED9ng. Karofi (35,9%) v\xE0 Kangaroo (40,9%) ti\u1EBFp t\u1EE5c tham gia c\xE1c l\u0129nh v\u1EF1c l\u1EDBn th\u1EA3o lu\u1EADn th\u1ECB tr\u01B0\u1EDDng. C\u1EA7n ph\xE1t tri\u1EC3n c\xE1c mini-game ho\u1EB7c ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn c\u1ED9ng \u0111\u1ED3ng \u0111\u1EC3 k\xEDch th\xEDch ho\u1EA1t \u0111\u1ED9ng t\u01B0\u01A1ng t\xE1c t\u1EF1 nhi\xEAn h\u01A1n.",
          kol_koc: "\u0110\xE3 ho\xE0n thi\u1EC7n v\xE0 on air 1 KOC cho N\u1ED3i c\u01A1m \u0111i\u1EC7n, 1 KOC Qu\u1EA1t c\xE2y, 1 KOC \u0110i\u1EC1u h\xF2a v\xE0 1 KOL \u0110i\u1EC1u h\xF2a l\xEAn b\xE0i.",
          content: "Facebook v\xE0 Instagram lu\xF4n duy tr\xEC \u1ED5n \u0111\u1ECBnh (\u0111\u1EA1t 5 b\xE0i Facebook, 3 b\xE0i Instagram). Ho\xE0n th\xE0nh s\u1EA3n xu\u1EA5t \u0111\xFAng h\u1EA1n 2 b\xE0i SEO Content v\xE0 c\xE1c trang s\u1EA3n ph\u1EA9m/video gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m",
          tvc: "",
          pr: "Th\xE1ng 5, ghi nh\u1EADn 2 b\xE0i b\xE1o ch\xED cho Ng\xE0nh 1 (\u0111\u1EA1t 20,858 views), 2 b\xE0i cho Ng\xE0nh 3 (\u0111\u1EA1t 12,099 views) v\xE0 1 b\xE0i cho Branding, \u0111\u1EC1u v\u01B0\u1EE3t ch\u1EC9 ti\xEAu l\u01B0\u1EE3ng xem",
          ooh: "Th\xE1ng 5 ghi nh\u1EADn k\u1EBFt qu\u1EA3 tri\u1EC3n khai chi\u1EBFn d\u1ECBch LCD Building (\u0111\u1EA1t 2,856 locations v\xE0 10,794 screens, v\u01B0\u1EE3t target). C\xE1c k\xEAnh LED Cities (12) v\xE0 LED Airport (7) \u0111\u1EA1t 100% k\u1EBF ho\u1EA1ch.",
          paid_ads: "Facebook Branding \u0111\u1EA1t ng\xE2n s\xE1ch ~20 tri\u1EC7u VN\u0110 v\u1EDBi CPM t\u1ED1i \u01B0u h\u01A1n m\u1EE5c ti\xEAu (11.67 so v\u1EDBi target 12). Youtube v\xE0 Facebook Ng\xE0nh 1, Ng\xE0nh 3 \u0111\u1EA1t hi\u1EC7u qu\u1EA3 hi\u1EC3n th\u1ECB (Impressions) t\u1ED1t. Ng\xE0nh 2 tr\xEAn Facebook chi ti\xEAu v\u01B0\u1EE3t m\u1EE9c tu\u1EA7n (~79.8M VN\u0110) gi\xFAp l\u01B0\u1EE3ng Reach t\u0103ng m\u1EA1nh (3.04M)",
          seo: "Website SEO duy tr\xEC phong \u0111\u1ED9 \u1ED5n \u0111\u1ECBnh v\u1EDBi S\u1ED1 l\u1EA7n hi\u1EC3n th\u1ECB \u0111\u1EA1t 148.962 (b\u1EB1ng 94% m\u1EE5c ti\xEAu tu\u1EA7n). L\u01B0\u1EE3ng Traffic Organic \u0111\u1EA1t 3.246 l\u01B0\u1EE3t. \u0110\u1EC3 \u0111\u1EA1t \u0111\u01B0\u1EE3c m\u1EE5c ti\xEAu 15.000 L\u01B0u l\u01B0\u1EE3ng truy c\u1EADp trong th\xE1ng, c\u1EA7n t\u0103ng c\u01B0\u1EDDng \u0111i li\xEAn k\u1EBFt n\u1ED9i b\u1ED9 v\xE0 c\u1EADp nh\u1EADt th\xEAm c\xE1c b\xE0i vi\u1EBFt chia s\u1EBB M\u1EB9o v\u1EB7t gia \u0111\xECnh.",
          btl_trade: "Tu\u1EA7n n\xE0y ghi nh\u1EADn S\u1EA3n xu\u1EA5t t\xEDch l\u0169y \u0111\u01B0\u1EE3c 3 bi\u1EC3n b\u1EA3ng, 7 qu\u1EA7y k\u1EC7, 138 r\u1ED1i h\u01A1i v\xE0 b\xE0n giao mock up \u0111i\u1EC1u h\xF2a (239 MT, 320 GT). Ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh ho\xE0n th\xE0nh t\u1EA1i 4 \u0111i\u1EC3m b\xE1n MT"
        }
      },
      Karofi: {
        evaluation: "** Karofi duy tr\xEC phong \u0111\u1ED9 r\u1EA5t t\u1ED1t khi n\u1EAFm gi\u1EEF th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn l\u1EDBn (SOV \u0111\u1EA1t 37.4%, rank 2 trong s\u1ED1 c\xE1c th\u01B0\u01A1ng hi\u1EC7u \u0111ang theo d\xF5i). \n** C\xE1c ho\u1EA1t \u0111\u1ED9ng Paid Ads, SEO Website v\xE0 s\u1EA3n xu\u1EA5t n\u1ED9i dung \u0111\u1EC1u ho\xE0n th\xE0nh v\u01B0\u1EE3t ho\u1EB7c \u0111\u1EA1t 100% KPI tu\u1EA7n.  ",
        proposals: "** Ti\u1EBFp t\u1EE5c t\u1ED1i \u01B0u n\u1ED9i dung qu\u1EA3ng c\xE1o \u0111\u1EC3 duy tr\xEC ch\u1EC9 s\u1ED1 CPM t\u1ED1t.  \n** T\u1EADp trung gi\u1EEF SOV : X\xE2y d\u1EF1ng c\xE1c n\u1ED9i dung mang t\xEDnh th\u1EA3o lu\u1EADn t\u1EF1 nhi\xEAn (th\u1EA3o lu\u1EADn h\u1EEFu c\u01A1) tr\xEAn c\xE1c h\u1ED9i nh\xF3m \u0111\u1ED3 gia d\u1EE5ng \u0111\u1EC3 c\u1EA3i thi\u1EC7n ch\u1EC9 s\u1ED1 hi\u1EC7u \u1EE9ng SOV.\n** \u0110\u1EA9y m\u1EA1nh ho\u1EA1t \u0111\u1ED9ng BTL, \u0111\u1EB7c bi\u1EC7t l\xE0 chu\u1EA9n b\u1ECB cho c\xE1c s\u1EF1 ki\u1EC7n Activation v\xE0 Workshop.  ",
        categories: {
          sov: "Karofi chi\u1EBFm 35.9% th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn to\xE0n ng\xE0nh, gi\u1EEF v\u1ECB th\u1EBF th\u01B0\u01A1ng hi\u1EC7u top-of-mind c\xF9ng Kangaroo. Kho\u1EA3ng c\xE1ch v\u1EDBi \u0111\u1ED1i th\u1EE7 b\xE1m \u0111u\u1ED5i Sunhouse (14.4%) kh\xE1 an to\xE0n. Th\u1EA3o lu\u1EADn t\u1EADp trung v\xE0o ch\u1EA5t l\u01B0\u1EE3ng l\u1ECDc n\u01B0\u1EDBc tinh khi\u1EBFt v\xE0 d\u1ECBch v\u1EE5 b\u1EA3o h\xE0nh chuy\xEAn nghi\u1EC7p.",
          kol_koc: "",
          content: "\u0110\u1EA1t 100% k\u1EBF ho\u1EA1ch tu\u1EA7n v\u1EDBi 3 b\xE0i Facebook, 1 b\xE0i SEO Content v\xE0 3 trang s\u1EA3n ph\u1EA9m \u0111\u01B0\u1EE3c nghi\u1EC7m thu. H\u1ED7 tr\u1EE3 d\u1EF1ng m\u1EDBi th\xE0nh c\xF4ng 2 video cho s\xE0n E-com",
          tvc: "",
          pr: "Trong th\xE1ng 5, ghi nh\u1EADn l\xEAn s\xF3ng 1 b\xE0i b\xE1o ch\xED cho Ng\xE0nh 1, thu h\xFAt \u0111\u01B0\u1EE3c 21,948 l\u01B0\u1EE3t xem (v\u01B0\u1EE3t m\u1EE5c ti\xEAu 20,000 views).",
          ooh: "Trong th\xE1ng 5, h\u1EA1ng m\u1EE5c n\xE0y tri\u1EC3n khai m\u1EA1nh m\u1EBD v\u1EDBi 3,280 v\u1ECB tr\xED LCD Building (v\u01B0\u1EE3t target 3,100), 26 v\u1ECB tr\xED LED Cities, 18 v\u1ECB tr\xED LED Airport v\xE0 31 v\u1ECB tr\xED Pano to\xE0n qu\u1ED1c.",
          paid_ads: "Facebook Ng\xE0nh 1 chi ti\xEAu ~79.8 tri\u1EC7u VN\u0110, b\xE1m s\xE1t k\u1EBF ho\u1EA1ch 80 tri\u1EC7u VN\u0110; CPM gi\u1EEF \u0111\xFAng cam k\u1EBFt \u1EDF m\u1EE9c 10.",
          seo: "SEO Website s\u1EB5n s\xE0ng m\u1EA1nh m\u1EBD trong tu\u1EA7n n\xE0y. C\u1EA3 hai ch\u1EC9 s\u1ED1 quan tr\u1ECDng l\xE0 Traffic Organic (18.852) v\xE0 Impressions Organic (548.338) \u0111\u1EC1u v\u01B0\u1EE3t qua k\u1EBF ho\u1EA1ch tu\u1EA7n (l\u1EA7n \u0111\u1EA1t 104,7% v\xE0 109,6%). \u0110i\u1EC1u n\xE0y ch\u1EE9ng t\u1ECF ch\u1EA5t l\u01B0\u1EE3ng t\u1EEB kh\xF3a v\xE0 n\u1ED9i dung Always-On \u0111ang ho\u1EA1t \u0111\u1ED9ng xu\u1EA5t s\u1EAFc.",
          btl_trade: "Tri\u1EC3n khai 40 bi\u1EC3n b\u1EA3ng, 45 qu\u1EA7y k\u1EC7 v\xE0 146 r\u1ED1i h\u01A1i. Ki\u1EC3m tra th\u1EF1c t\u1EBF h\xECnh \u1EA3nh \u0111\u1EA1t 98 \u0111i\u1EC3m b\xE1n MT v\xE0 40 \u0111i\u1EC3m b\xE1n GT, \u0111\u1ED3ng th\u1EDDi ho\xE0n th\xE0nh ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh online cho 357 \u0111i\u1EC3m b\xE1n MT v\xE0 2,028 \u0111i\u1EC3m b\xE1n GT."
        }
      }
    },
    "19/06-25/06/2026": {
      Livotec: {
        evaluation: "Tu\u1EA7n n\xE0y Livotec t\u1EADp trung ng\xE2n s\xE1ch \u0111\u1EA9y m\u1EA1nh Paid Ads tr\xEAn k\xEAnh TikTok k\u1EBFt h\u1EE3p v\u1EDBi KOC. Hi\u1EC7u qu\u1EA3 qu\u1EA3ng c\xE1o s\u1ED1 r\u1EA5t t\u1ED1t khi c\xE1c ch\u1EC9 s\u1ED1 Reach v\xE0 Impressions \u0111\u1EC1u v\u01B0\u1EE3t k\u1EF3 v\u1ECDng. Ho\u1EA1t \u0111\u1ED9ng Trade Marketing (BTL) b\xE1m s\xE1t ti\u1EBFn \u0111\u1ED9 th\xE1ng. Tuy nhi\xEAn m\u1EA3ng KOC/KOL t\u1EF1 nhi\xEAn tu\u1EA7n n\xE0y kh\xF4ng c\xF3 th\xEAm s\u1ED1 l\u01B0\u1EE3ng b\xE0i m\u1EDBi do qu\xE1 tr\xECnh xoay ca \u0111\u1ED5i m\xE1y,",
        proposals: "** K\u1EBF ho\u1EA1ch KOC/KOL c\u1EA7n \u0111\u01B0\u1EE3c th\xFAc \u0111\u1EA9y g\u1EAFt gao h\u01A1n v\xEC s\u1ED1 l\u01B0\u1EE3ng nghi\u1EC7m thu tu\u1EA7n n\xE0y b\u1EB1ng 0.  \n** Ti\u1EBFp t\u1EE5c t\u1ED1i \u01B0u h\xF3a l\u01B0\u1EE3ng Traffic Organic cho Website v\xEC ti\u1EBFn \u0111\u1ED9 mtd v\u1EABn \u0111ang th\u1EA5p h\u01A1n target tu\u1EA7n.  \n",
        categories: {
          sov: "Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (SOV) c\u1EE7a Livotec hi\u1EC7n t\u1EA1i ch\u1EC9 \u0111\u1EA1t 2.8%, \u0111\u1EE9ng th\u1EE9 5 trong nh\xF3m c\xE1c th\u01B0\u01A1ng hi\u1EC7u \u0111\u01B0\u1EE3c \u0111o l\u01B0\u1EDDng. Karofi (35.9%) v\xE0 Kangaroo (40.9%) ti\u1EBFp t\u1EE5c chi\u1EBFm l\u0129nh ph\u1EA7n l\u1EDBn th\u1EA3o lu\u1EADn th\u1ECB tr\u01B0\u1EDDng. C\u1EA7n tri\u1EC3n khai c\xE1c mini-game ho\u1EB7c ch\u1EE7 \u0111\u1EC1 th\u1EA3o lu\u1EADn c\u1ED9ng \u0111\u1ED3ng \u0111\u1EC3 k\xEDch ho\u1EA1t l\u01B0\u1EE3ng t\u01B0\u01A1ng t\xE1c t\u1EF1 nhi\xEAn l\u1EDBn h\u01A1n.",
          kol_koc: "Th\u1EF1c t\u1EBF tri\u1EC3n khai trong tu\u1EA7n ghi nh\u1EADn 0 b\xE0i l\xEAn m\u1EDBi t\u1EEB c\xE1c nh\xF3m ng\xE0nh do c\xE1c KOL/KOC \u0111ang trong qu\xE1 tr\xECnh s\u1EA3n xu\u1EA5t",
          content: "Facebook v\u01B0\u1EE3t k\u1EBF ho\u1EA1ch (5/4 b\xE0i), Instagram \u0111\u1EA1t 100% (3/3 b\xE0i). \u0110\u1EA1t ch\u1EC9 ti\xEAu 2 b\xE0i SEO Content cho Ng\xE0nh 1 v\xE0 Ng\xE0nh 3.\nnghi\u1EC7m thu 1 video clip TVC cho Ng\xE0nh 3 \u0111\xFAng ti\u1EBFn \u0111\u1ED9.",
          tvc: "",
          pr: "",
          ooh: "",
          paid_ads: "Qu\u1EA3ng c\xE1o TikTok KOC/KOL \u0111\u1EA1t hi\u1EC7u qu\u1EA3 b\xF9ng n\u1ED5 khi chi ti\xEAu 65M VN\u0110 (d\u01B0\u1EDBi target 74M VN\u0110) nh\u01B0ng thu v\u1EC1 t\u1EDBi 7.79M Impressions (target 5.28M) v\xE0 3.25M Reach (target 2.11M), CPM gi\u1EA3m s\xE2u xu\u1ED1ng 8.344. C\xE1c ng\xE0nh 1, 2, 3 tr\xEAn Facebook v\xE0 TikTok \u0111\u1EC1u ki\u1EC3m so\xE1t chi ph\xED r\u1EA5t t\u1ED1t v\xE0 \u0111\u1EA1t l\u01B0\u1EE3ng Reach v\u01B0\u1EE3t ch\u1EC9 ti\xEAu.",
          seo: "Website SEO duy tr\xEC phong \u0111\u1ED9 \u1ED5n \u0111\u1ECBnh v\u1EDBi S\u1ED1 l\u1EA7n hi\u1EC3n th\u1ECB \u0111\u1EA1t 148.962 (b\u1EB1ng 94% m\u1EE5c ti\xEAu tu\u1EA7n). L\u01B0\u1EE3ng Traffic Organic \u0111\u1EA1t 3.246 l\u01B0\u1EE3t. \u0110\u1EC3 \u0111\u1EA1t \u0111\u01B0\u1EE3c m\u1EE5c ti\xEAu 15.000 L\u01B0u l\u01B0\u1EE3ng truy c\u1EADp trong th\xE1ng, c\u1EA7n t\u0103ng c\u01B0\u1EDDng \u0111i li\xEAn k\u1EBFt n\u1ED9i b\u1ED9 v\xE0 c\u1EADp nh\u1EADt th\xEAm c\xE1c b\xE0i vi\u1EBFt chia s\u1EBB.",
          btl_trade: "Ti\u1EBFp t\u1EE5c tri\u1EC3n khai b\u1ED5 sung qu\u1EA7y k\u1EC7 (7) v\xE0 r\u1ED1i h\u01A1i m\u1EB7t ti\u1EC1n (138). \u0110\u1EA1t ch\u1EC9 ti\xEAu ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh cho 4 \u0111i\u1EC3m b\xE1n MT."
        }
      },
      Karofi: {
        evaluation: "** SOV c\u1EA1nh tranh c\u1EE7a Karofi gi\u1EA3m nh\u1EB9 xu\u1ED1ng 35.9% (b\u1ECB th\u01B0\u01A1ng hi\u1EC7u Kang v\u01B0\u1EE3t l\xEAn d\u1EABn tr\u01B0\u1EDBc v\u1EDBi 40.9%) \n** Ho\u1EA1t \u0111\u1ED9ng qu\u1EA3ng c\xE1o Paid Ads v\xE0 Content t\u1EA1i Retail v\u1EABn v\u1EADn h\xE0nh v\xF4 c\xF9ng hi\u1EC7u qu\u1EA3 v\xE0 \u1ED5n \u0111\u1ECBnh.\n",
        proposals: "** C\u1EA7n c\xF3 chi\u1EBFn d\u1ECBch Content thu h\xFAt t\u01B0\u01A1ng t\xE1c tr\xEAn Social \u0111\u1EC3 gi\xE0nh l\u1EA1i th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (SOV).  \n** \u0110\u1EA9y nhanh ti\u1EBFn \u0111\u1ED9 gi\u1EA3i ng\xE2n POSM v\xE0 chu\u1EA9n b\u1ECB cho s\u1EF1 ki\u1EC7n th\u1EF1c t\u1EBF.\n",
        categories: {
          sov: "Do ph\xE1t sinh 7 tin ti\xEAu c\u1EF1c trong tu\u1EA7n, d\u1EABn t\u1EDBi ch\u1EC9 s\u1ED1 SOV tu\u1EA7n n\xE0y gi\u1EA3m nh\u1EB9 xu\u1ED1ng m\u1EE9c 35.9%. \nC\xE1c tin ti\xEAu c\u1EF1c \u0111\xE3 v\xE0 \u0111ang \u0111\u01B0\u1EE3c CSKH take action  x\u1EED l\xFD ngay l\u1EADp t\u1EE9c sau khi nh\u1EADn \u0111\u01B0\u1EE3c th\xF4ng tin\n",
          kol_koc: "",
          content: "N\u1ED9i dung Social ch\u1EA1y \u1ED5n \u0111\u1ECBnh \u0111\u1EA1t 4 b\xE0i Facebook. C\xE1c b\xE0i vi\u1EBFt SEO, trang s\u1EA3n ph\u1EA9m v\xE0 ch\u1EC9nh s\u1EEDa n\u1ED9i dung tuy\u1EC7t \u0111\u1ED1i \u0111\u1EC1u \u0111\u1EA1t 100% KPI tu\u1EA7n",
          tvc: "S\u1EA3n l\u01B0\u1EE3ng ph\xE1t s\xF3ng TVC b\xE1m s\xE1t k\u1EBF ho\u1EA1ch. C\xE1c ch\u1EC9 s\u1ED1 GRPS tr\xEAn c\xE1c \u0111\xE0i truy\u1EC1n h\xECnh tr\u1ECDng \u0111i\u1EC3m \u0111\u01B0\u1EE3c ghi nh\u1EADn ch\xEDnh x\xE1c, ho\xE0n th\xE0nh \u0111\u1EA7y \u0111\u1EE7 m\u1EE5c ti\xEAu ph\u1EE7 s\xF3ng chi\u1EBFn d\u1ECBch.",
          pr: "",
          ooh: "",
          paid_ads: "Facebook Ng\xE0nh 1 chi ti\xEAu 75M VN\u0110, mang l\u1EA1i h\u01A1n 8M Impressions v\xE0 3.57M Reach (\u0111\u1EC1u v\u01B0\u1EE3t KPI tu\u1EA7n), ch\u1EC9 s\u1ED1 CPM t\u1ED1i \u01B0u t\u1ED1t \u1EDF m\u1EE9c 9.27.",
          seo: "C\u1EA3 hai ch\u1EC9 s\u1ED1 quan tr\u1ECDng l\xE0 Traffic Organic (18.852) v\xE0 Impressions Organic (548.338) \u0111\u1EC1u v\u01B0\u1EE3t k\u1EBF ho\u1EA1ch tu\u1EA7n (l\u1EA7n l\u01B0\u1EE3t \u0111\u1EA1t 104.7% v\xE0 109.6%). \u0110i\u1EC1u n\xE0y ch\u1EE9ng t\u1ECF ch\u1EA5t l\u01B0\u1EE3ng t\u1EEB kh\xF3a v\xE0 n\u1ED9i dung Always-On \u0111ang ho\u1EA1t \u0111\u1ED9ng xu\u1EA5t s\u1EAFc.",
          btl_trade: "Ho\u1EA1t \u0111\u1ED9ng ki\u1EC3m so\xE1t \u0111i\u1EC3m b\xE1n di\u1EC5n ra c\u1EF1c k\u1EF3 ch\u1EB7t ch\u1EBD, ho\xE0n th\xE0nh ki\u1EC3m tra th\u1EF1c t\u1EBF 98 \u0111i\u1EC3m MT, 40 \u0111i\u1EC3m GT v\xE0 ch\u1EA5m \u0111i\u1EC3m h\xECnh \u1EA3nh cho t\u1ED5ng c\u1ED9ng g\u1EA7n 2,400 \u0111i\u1EC3m b\xE1n."
        }
      }
    }
  }
};

// src/data.ts
function getEndOfWeekDate(str) {
  const TIMELINE_LABELS_MAP = {
    "week4": "19/06 - 25/06/2026",
    "week3": "12/06 - 18/06/2026",
    "week2": "05/06 - 11/06/2026",
    "week1": "01/06 - 04/06/2026"
  };
  if (TIMELINE_LABELS_MAP[str]) {
    str = TIMELINE_LABELS_MAP[str];
  }
  const parts = str.split(/-|\s+-\s+/);
  if (parts.length >= 2) {
    const endDateStr = parts[parts.length - 1].trim();
    const cleaned = endDateStr.replace(/[^0-9/]/g, "");
    const dateParts = cleaned.split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      return { day, month, year };
    }
  } else {
    const cleanStr = str.replace(/[^0-9/\-]/g, "");
    const p = cleanStr.split("-");
    if (p.length >= 2) {
      const endDateStr = p[p.length - 1];
      const dateParts = endDateStr.split("/");
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        return { day, month, year };
      }
    }
  }
  return { day: 25, month: 6, year: 2026 };
}
function getBtlReportMonth(weekStr) {
  const endInfo = getEndOfWeekDate(weekStr);
  return { month: endInfo.month, year: endInfo.year };
}
function normalizeMarketingData(parsed) {
  const getVal = (obj, keys) => {
    if (!obj) return null;
    for (const k of keys) {
      if (k in obj) return obj[k];
    }
    const objKeys = Object.keys(obj);
    for (const k of keys) {
      const foundKey = objKeys.find((ok) => ok.trim().toLowerCase() === k.trim().toLowerCase());
      if (foundKey) return obj[foundKey];
    }
    return null;
  };
  const getNumVal = (obj, keys) => {
    const val = getVal(obj, keys);
    if (val === void 0 || val === null || val === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };
  const digital_marketing = Array.isArray(parsed?.digital_marketing) ? parsed.digital_marketing.map((row) => {
    const rawBrand = getVal(row, ["brand"]) || "";
    const normalizedBrand = rawBrand.toString().trim().toLowerCase() === "livotec" ? "Livotec" : rawBrand.toString().trim().toLowerCase() === "karofi" ? "Karofi" : rawBrand.toString().trim();
    const rawNhom = getVal(row, ["nh\xF3m_b\xE1o_c\xE1o", "nh\xF3m b\xE1o c\xE1o"]) || "";
    const normalizedNhom = rawNhom.toString().trim().toLowerCase() === "content" ? "Content" : rawNhom.toString().trim().toLowerCase() === "digital" ? "Digital" : rawNhom.toString().trim().toLowerCase() === "brand" ? "Brand" : rawNhom.toString().trim();
    const rawHangMuc = getVal(row, ["h\u1EA1ng_m\u1EE5c", "h\u1EA1ng m\u1EE5c"]) || "";
    const rawHangMucLower = rawHangMuc.toString().trim().toLowerCase();
    let normalizedHangMuc = rawHangMuc.toString().trim();
    if (rawHangMucLower === "paid ads") normalizedHangMuc = "Paid Ads";
    else if (rawHangMucLower === "seo website") normalizedHangMuc = "SEO Website";
    else if (rawHangMucLower === "seo content") normalizedHangMuc = "SEO Content";
    else if (rawHangMucLower === "product page") normalizedHangMuc = "Product Page";
    else if (rawHangMucLower === "social listening") normalizedHangMuc = "Social Listening";
    else if (rawHangMucLower === "pr - b\xE1o ch\xED" || rawHangMucLower === "pr" || rawHangMucLower === "pr_b\xE1o_ch\xED") normalizedHangMuc = "PR - b\xE1o ch\xED";
    else if (rawHangMucLower === "clip tvc") normalizedHangMuc = "Clip TVC";
    else if (rawHangMucLower === "social media") normalizedHangMuc = "Social Media";
    else if (rawHangMucLower === "tvc") normalizedHangMuc = "TVC";
    const rawMetric = getVal(row, ["ch\u1EC9_s\u1ED1_metric", "ch\u1EC9 s\u1ED1 (metric)", "ch\u1EC9 s\u1ED1"]) || "";
    const rawMetricLower = rawMetric.toString().trim().toLowerCase();
    let normalizedMetric = rawMetric.toString().trim();
    if (rawMetricLower.includes("amount spent") || rawMetricLower.includes("amount_spent")) normalizedMetric = "Amount spent (VN\u0110)";
    else if (rawMetricLower === "impressions") normalizedMetric = "Impressions";
    else if (rawMetricLower === "reach") normalizedMetric = "Reach";
    else if (rawMetricLower === "frequency") normalizedMetric = "Frequency";
    else if (rawMetricLower === "traffic organic") normalizedMetric = "Traffic Organic";
    else if (rawMetricLower === "impressions organic") normalizedMetric = "Impressions Organic";
    else if (rawMetricLower === "quantity") normalizedMetric = "Quantity";
    else if (rawMetricLower.includes("sov")) normalizedMetric = "SOV (Th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn theo brand)";
    return {
      week: (getVal(row, ["week"]) || "").toString().trim(),
      ph\u00E2n_lo\u1EA1i_th\u1EDDi_gian: (getVal(row, ["ph\xE2n_lo\u1EA1i_th\u1EDDi_gian", "ph\xE2n lo\u1EA1i th\u1EDDi gian"]) || "").toString().trim(),
      brand: normalizedBrand,
      nh\u00F3m_b\u00E1o_c\u00E1o: normalizedNhom,
      h\u1EA1ng_m\u1EE5c: normalizedHangMuc,
      ng\u00E0nh_h\u00E0ng: (getVal(row, ["ng\xE0nh_h\xE0ng", "ng\xE0nh h\xE0ng"]) || "").toString().trim(),
      k\u00EAnh_channel: (getVal(row, ["k\xEAnh_channel", "k\xEAnh (channel)", "k\xEAnh"]) || "").toString().trim(),
      ch\u1EC9_s\u1ED1_metric: normalizedMetric,
      m\u1EE5c_ti\u00EAu_target: getNumVal(row, ["m\u1EE5c_ti\xEAu_target", "m\u1EE5c ti\xEAu (target)", "m\u1EE5c ti\xEAu"]),
      th\u1EF1c_t\u1EBF_actual: getNumVal(row, ["th\u1EF1c_t\u1EBF_actual", "th\u1EF1c t\u1EBF (actual)", "th\u1EF1c t\u1EBF"]),
      target_th\u00E1ng: getNumVal(row, ["target_th\xE1ng", "target th\xE1ng"]),
      t\u00EDch_l\u0169y_th\u00E1ng: getNumVal(row, ["t\xEDch_l\u0169y_th\xE1ng", "t\xEDch l\u0169y th\xE1ng"])
    };
  }) : [];
  const kol_koc = Array.isArray(parsed?.kol_koc) ? parsed.kol_koc.map((row) => {
    const rawBrand = getVal(row, ["brand"]) || "";
    const normalizedBrand = rawBrand.toString().trim().toLowerCase() === "livotec" ? "Livotec" : rawBrand.toString().trim().toLowerCase() === "karofi" ? "Karofi" : rawBrand.toString().trim();
    const rawHangMuc = getVal(row, ["h\u1EA1ng_m\u1EE5c", "h\u1EA1ng m\u1EE5c"]) || "";
    const rawHangMucLower = rawHangMuc.toString().trim().toLowerCase();
    let normalizedHangMuc = rawHangMuc.toString().trim();
    if (rawHangMucLower === "koc/kol" || rawHangMucLower === "kol/koc" || rawHangMucLower === "koc" || rawHangMucLower === "kol") normalizedHangMuc = "koc/kol";
    const rawMetric = getVal(row, ["ch\u1EC9_s\u1ED1_metric", "ch\u1EC9 s\u1ED1 (metric)", "ch\u1EC9 s\u1ED1"]) || "";
    const rawMetricLower = rawMetric.toString().trim().toLowerCase();
    let normalizedMetric = rawMetric.toString().trim();
    if (rawMetricLower === "quantity") normalizedMetric = "quantity";
    return {
      week: (getVal(row, ["week"]) || "").toString().trim(),
      brand: normalizedBrand || "Livotec",
      h\u1EA1ng_m\u1EE5c: normalizedHangMuc,
      ng\u00E0nh_h\u00E0ng: (getVal(row, ["ng\xE0nh_h\xE0ng", "ng\xE0nh h\xE0ng"]) || "").toString().trim(),
      k\u00EAnh_channel: (getVal(row, ["k\xEAnh_channel", "k\xEAnh (channel)", "k\xEAnh"]) || "").toString().trim(),
      ch\u1EC9_s\u1ED1_metric: normalizedMetric,
      kpi_to\u00E0n_chi\u1EBFn_d\u1ECBch: getNumVal(row, ["kpi_to\xE0n_chi\u1EBFn_d\u1ECBch", "kpi to\xE0n chi\u1EBFn d\u1ECBch", "kpi to\xE0n chi\u1EBFn d\u1ECBch (kpi t\u1ED5ng)"]),
      th\u1EF1c_t\u1EBF_trong_tu\u1EA7n: getNumVal(row, ["th\u1EF1c_t\u1EBF_trong_tu\u1EA7n", "th\u1EF1c t\u1EBF trong tu\u1EA7n"]),
      t\u00EDch_l\u0169y_chi\u1EBFn_d\u1ECBch: getNumVal(row, ["t\xEDch_l\u0169y_chi\u1EBFn_d\u1ECBch", "t\u1ED5ng t\xEDch l\u0169y", "t\xEDch l\u0169y chi\u1EBFn d\u1ECBch"])
    };
  }) : [];
  const btl_trade_monthly = Array.isArray(parsed?.btl_trade_monthly) ? parsed.btl_trade_monthly.map((row) => {
    const rawBrand = getVal(row, ["brand"]) || "";
    const normalizedBrand = rawBrand.toString().trim().toLowerCase() === "livotec" ? "Livotec" : rawBrand.toString().trim().toLowerCase() === "karofi" ? "Karofi" : rawBrand.toString().trim();
    const rawHangMucLon = getVal(row, ["h\u1EA1ng_m\u1EE5c_l\u1EDBn", "h\u1EA1ng m\u1EE5c l\u1EDBn"]) || "";
    const rawHangMucLonUpper = rawHangMucLon.toString().trim().toUpperCase();
    let normalizedHangMucLon = rawHangMucLon.toString().trim();
    if (rawHangMucLonUpper === "POSM") normalizedHangMucLon = "POSM";
    return {
      month: getNumVal(row, ["month", "th\xE1ng"]) || 5,
      year: getNumVal(row, ["year", "n\u0103m"]) || 2026,
      brand: normalizedBrand,
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: normalizedHangMucLon,
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: (getVal(row, ["chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c", "chi ti\u1EBFt h\u1EA1ng m\u1EE5c"]) || "").toString().trim(),
      ph\u00E2n_lo\u1EA1i: getVal(row, ["ph\xE2n_lo\u1EA1i", "ph\xE2n lo\u1EA1i"]) || null,
      t\u1EA7n_su\u1EA5t: (getVal(row, ["t\u1EA7n_su\u1EA5t", "t\u1EA7n su\u1EA5t"]) || "").toString().trim(),
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: (getVal(row, ["\u0111\u01A1n_v\u1ECB_t\xEDnh", "\u0111\u01A1n v\u1ECB t\xEDnh"]) || "").toString().trim(),
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: getNumVal(row, ["th\u1EF1c_hi\u1EC7n_th\xE1ng", "th\u1EF1c hi\u1EC7n th\xE1ng", "gi\xE1_tr\u1ECB", "gi\xE1 tr\u1ECB"])
    };
  }) : [];
  const btl_trade = Array.isArray(parsed?.btl_trade) ? parsed.btl_trade.map((row) => {
    const rawBrand = getVal(row, ["brand"]) || "";
    const normalizedBrand = rawBrand.toString().trim().toLowerCase() === "livotec" ? "Livotec" : rawBrand.toString().trim().toLowerCase() === "karofi" ? "Karofi" : rawBrand.toString().trim();
    const rawHangMucLon = getVal(row, ["h\u1EA1ng_m\u1EE5c_l\u1EDBn", "h\u1EA1ng m\u1EE5c l\u1EDBn"]) || "";
    const rawHangMucLonUpper = rawHangMucLon.toString().trim().toUpperCase();
    let normalizedHangMucLon = rawHangMucLon.toString().trim();
    if (rawHangMucLonUpper === "POSM") normalizedHangMucLon = "POSM";
    const getBtlField = (keysToCheck) => {
      for (const k of keysToCheck) {
        const val = getNumVal(row, [k]);
        if (val !== null) return val;
      }
      for (const rawK of Object.keys(row)) {
        const normalizedK = rawK.toLowerCase().replace(/\s+/g, "_").trim();
        for (const expected of keysToCheck) {
          const expectedClean = expected.toLowerCase().replace(/\s+/g, "_").trim();
          if (normalizedK === expectedClean || normalizedK.startsWith(expectedClean)) {
            const val = Number(row[rawK]);
            if (!isNaN(val) && row[rawK] !== "" && row[rawK] !== null) return val;
          }
        }
      }
      return null;
    };
    const weekStr = (getVal(row, ["week"]) || "").toString().trim();
    const info = getBtlReportMonth(weekStr);
    const thisMonth = info.month;
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastYear = thisMonth === 1 ? info.year - 1 : info.year;
    const chiTiet = (getVal(row, ["chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c", "chi ti\u1EBFt h\u1EA1ng m\u1EE5c"]) || "").toString().trim();
    const phanLoai = getVal(row, ["ph\xE2n_lo\u1EA1i", "ph\xE2n lo\u1EA1i"]) || null;
    const tanSuat = (getVal(row, ["t\u1EA7n_su\u1EA5t", "t\u1EA7n su\u1EA5t"]) || "").toString().trim();
    const donViTinh = (getVal(row, ["\u0111\u01A1n_v\u1ECB_t\xEDnh", "\u0111\u01A1n v\u1ECB t\xEDnh"]) || "").toString().trim();
    const linkedMonthlyRow = btl_trade_monthly.find((mRow) => {
      return mRow.month === lastMonth && mRow.year === lastYear && mRow.brand.toLowerCase() === normalizedBrand.toLowerCase() && mRow.h\u1EA1ng_m\u1EE5c_l\u1EDBn.toLowerCase() === normalizedHangMucLon.toLowerCase() && mRow.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c.toLowerCase() === chiTiet.toLowerCase() && (mRow.ph\u00E2n_lo\u1EA1i || "").toString().toLowerCase() === (phanLoai || "").toString().toLowerCase() && mRow.t\u1EA7n_su\u1EA5t.toLowerCase() === tanSuat.toLowerCase() && mRow.\u0111\u01A1n_v\u1ECB_t\u00EDnh.toLowerCase() === donViTinh.toLowerCase();
    });
    const btl_thuc_hien_thang = linkedMonthlyRow !== void 0 ? linkedMonthlyRow.th\u1EF1c_hi\u1EC7n_th\u00E1ng : getBtlField([
      "th\u1EF1c_hi\u1EC7n_th\xE1ng",
      "th\u1EF1c hi\u1EC7n th\xE1ng",
      `th\u1EF1c_hi\u1EC7n_th\xE1ng_${lastMonth}`,
      `th\u1EF1c hi\u1EC7n th\xE1ng ${lastMonth}`,
      "th\u1EF1c_hi\u1EC7n_th\xE1ng_5",
      "th\u1EF1c hi\u1EC7n th\xE1ng 5",
      "th\u1EF1c_hi\u1EC7n_th\xE1ng_6",
      "th\u1EF1c hi\u1EC7n th\xE1ng 6",
      "th\u1EF1c_hi\u1EC7n_th\xE1ng_7",
      "th\u1EF1c hi\u1EC7n th\xE1ng 7",
      "th\u1EF1c_hi\u1EC7n_th\xE1ng_8",
      "th\u1EF1c hi\u1EC7n th\xE1ng 8"
    ]);
    const resultRow = {
      week: weekStr,
      brand: normalizedBrand,
      h\u1EA1ng_m\u1EE5c_l\u1EDBn: normalizedHangMucLon,
      chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: chiTiet,
      ph\u00E2n_lo\u1EA1i: phanLoai,
      t\u1EA7n_su\u1EA5t: tanSuat,
      \u0111\u01A1n_v\u1ECB_t\u00EDnh: donViTinh,
      th\u1EF1c_hi\u1EC7n_th\u00E1ng: btl_thuc_hien_thang,
      k\u1EBF_ho\u1EA1ch_th\u00E1ng: getBtlField([
        "k\u1EBF_ho\u1EA1ch_th\xE1ng",
        "k\u1EBF ho\u1EA1ch th\xE1ng",
        `k\u1EBF_ho\u1EA1ch_th\xE1ng_${thisMonth}`,
        `k\u1EBF ho\u1EA1ch th\xE1ng ${thisMonth}`,
        "k\u1EBF_ho\u1EA1ch_th\xE1ng_6",
        "k\u1EBF ho\u1EA1ch th\xE1ng 6",
        "k\u1EBF_ho\u1EA1ch_th\xE1ng_7",
        "k\u1EBF hi\u1EC7n th\xE1ng 7",
        "k\u1EBF ho\u1EA1ch th\xE1ng 7",
        "k\u1EBF_ho\u1EA1ch_th\xE1ng_8",
        "k\u1EBF ho\u1EA1ch th\xE1ng 8"
      ]),
      t\u00EDch_l\u0169y_th\u00E1ng: getBtlField([
        "t\xEDch_l\u0169y_th\xE1ng",
        "t\xEDch l\u0169y th\xE1ng",
        `t\xEDch_l\u0169y_th\xE1ng_${thisMonth}`,
        `t\xEDch l\u0169y th\xE1ng ${thisMonth}`,
        "t\xEDch_l\u0169y_th\xE1ng_6",
        "t\xEDch l\u0169y th\xE1ng 6",
        "t\xEDch_l\u0169y_th\xE1ng_7",
        "t\xEDch l\u0169y th\xE1ng 7",
        "t\xEDch_l\u0169y_th\xE1ng_8",
        "t\xEDch l\u0169y th\xE1ng 8"
      ])
    };
    return resultRow;
  }) : [];
  const oohPrRaw = parsed?.monthly_ooh_pr || parsed?.["pr & ooh"] || parsed?.["pr_ooh"];
  const monthly_ooh_pr = Array.isArray(oohPrRaw) ? oohPrRaw.map((row) => {
    const rawBrand = getVal(row, ["brand"]) || "";
    const normalizedBrand = rawBrand.toString().trim().toLowerCase() === "livotec" ? "Livotec" : rawBrand.toString().trim().toLowerCase() === "karofi" ? "Karofi" : rawBrand.toString().trim();
    const rawHangMuc = getVal(row, ["h\u1EA1ng_m\u1EE5c"]) || "";
    const rawHangMucLower = rawHangMuc.toString().trim().toLowerCase();
    let normalizedHangMuc = rawHangMuc.toString().trim();
    if (rawHangMucLower === "pr - b\xE1o ch\xED" || rawHangMucLower === "pr" || rawHangMucLower === "pr_b\xE1o_ch\xED") normalizedHangMuc = "PR - b\xE1o ch\xED";
    const rawMetric = getVal(row, ["ch\u1EC9_s\u1ED1_metric", "ch\u1EC9 s\u1ED1 (metric)", "ch\u1EC9 s\u1ED1"]) || "";
    const rawMetricLower = rawMetric.toString().trim().toLowerCase();
    let normalizedMetric = rawMetric.toString().trim();
    if (rawMetricLower === "quantity") normalizedMetric = "Quantity";
    return {
      week: (getVal(row, ["week"]) || "").toString().trim(),
      th\u00E1ng_b\u00E1o_c\u00E1o: (getVal(row, ["th\xE1ng_b\xE1o_c\xE1o"]) || "").toString().trim(),
      h\u1EA1ng_m\u1EE5c: normalizedHangMuc,
      brand: normalizedBrand,
      ng\u00E0nh_h\u00E0ng: (getVal(row, ["ng\xE0nh_h\xE0ng"]) || "").toString().trim(),
      k\u00EAnh_channel: (getVal(row, ["k\xEAnh_channel", "k\xEAnh (channel)", "k\xEAnh"]) || "").toString().trim(),
      ch\u1EC9_s\u1ED1_metric: normalizedMetric,
      m\u1EE5c_ti\u00EAu_target: getNumVal(row, ["m\u1EE5c_ti\xEAu_target", "m\u1EE5c ti\xEAu (target)"]),
      th\u1EF1c_t\u1EBF_actual: getNumVal(row, ["th\u1EF1c_t\u1EBF_actual", "th\u1EF1c t\u1EBF (actual)"])
    };
  }) : [];
  return {
    digital_marketing,
    kol_koc,
    btl_trade,
    monthly_ooh_pr,
    btl_trade_monthly
  };
}
var INITIAL_MARKETING_DATA = normalizeMarketingData(initial_data_default);

// src/server/supabaseClient.ts
var import_supabase_js = require("@supabase/supabase-js");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ path: ".env.local", quiet: true });
import_dotenv.default.config({ quiet: true });
var SUPABASE_URL = process.env.SUPABASE_URL || "";
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
var isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
if (!isSupabaseConfigured) {
  console.warn(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh \u2014 \u0111ang ch\u1EA1y \u1EDF ch\u1EBF \u0111\u1ED9 LOCAL-ONLY (d\u1EEF li\u1EC7u l\u01B0u v\xE0o src/db_store.json, kh\xF4ng \u0111\u1EE5ng \u0111\u1EBFn Supabase th\u1EADt). \u0110\xE2y l\xE0 h\xE0nh vi mong mu\u1ED1n cho m\xF4i tr\u01B0\u1EDDng dev c\u1EE5c b\u1ED9; ch\u1EC9 khai b\xE1o 2 bi\u1EBFn n\xE0y tr\xEAn Vercel (production)."
  );
}
var supabase = (0, import_supabase_js.createClient)(
  SUPABASE_URL || "https://placeholder.invalid",
  SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
var APP_STATE_ROW_ID = "main";

// src/lib/defaultUsers.ts
var DEFAULT_USERS = [
  { username: "ntkdung1206@gmail.com", salt: "1b59cef3728bd945106ace0e2a8feaf1", passwordHash: "scrypt:2a8392a87ea3c81a625c6d9cc09ee876f9aaa0f2e27c7a473b4e1633d3b58a0d3106dfb1929520f89aededc338057488b9cf40d3a37cfb8aaf121963b21dc507", name: "D\u0169ng Nguy\u1EC5n", role: "Admin" },
  { username: "admin", salt: "9a3400813aaa7e03ea5617378950727b", passwordHash: "scrypt:962b332155cc79a7d53dfd90efd38e43ab694c1eeb1f3758ab8d763c397b2b23241cd472afafc6fe39916bd6715df5b8b08c759a184dc618bb0df30a705c6065", name: "Qu\u1EA3n tr\u1ECB h\u1EC7 th\u1ED1ng", role: "Admin" },
  { username: "editor1", salt: "78352da124ad5c0f0590a1fb41e387ad", passwordHash: "scrypt:fba642d3dc46433ed8d869addd6d7eca85f7878257fe412bc12ee22f7f73c24a43ad28e644e1945d421f6391bc3d633f5230c34074379d77de2145faa92033b9", name: "Nguy\u1EC5n Bi\xEAn T\u1EADp", role: "Editor" },
  { username: "viewer1", salt: "9891b5004f979ed95778a77d487a15fc", passwordHash: "7fdc2efb593acbeb57e98d555a3fdce244f547a5a73fa13df66ad61678e2c7b9", name: "Ng\u01B0\u1EDDi xem", role: "Viewer" },
  { username: "viewer2", salt: "1bc2d4bf855a868da0e6b85fe199bdc6", passwordHash: "a1d752a1b080a097507451db46a0d1fb1581ac9a7d3317c05af4b326123de5be", name: "Viewer 2", role: "Viewer" }
];
var USERS_CONFIG_VERSION = 5;
function reconcileUsers(savedList, savedVersion) {
  if (savedVersion >= USERS_CONFIG_VERSION) {
    return savedList;
  }
  const defaultUsernames = new Set(DEFAULT_USERS.map((u) => u.username.toLowerCase()));
  const customExtras = savedList.filter(
    (u) => !defaultUsernames.has((u.username || "").toLowerCase()) && typeof u.username === "string" && typeof u.role === "string"
  );
  return [...DEFAULT_USERS, ...customExtras];
}

// src/lib/serverPasswordHash.ts
var import_crypto = __toESM(require("crypto"), 1);

// src/lib/passwordHash.ts
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digestBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digestBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, salt, expectedHash) {
  const computed = await hashPassword(password, salt);
  return computed === expectedHash;
}

// src/lib/serverPasswordHash.ts
var SCRYPT_PREFIX = "scrypt:";
var SCRYPT_KEYLEN = 64;
function generateServerSalt() {
  return import_crypto.default.randomBytes(16).toString("hex");
}
function hashPasswordScrypt(password, salt) {
  const derived = import_crypto.default.scryptSync(password, salt, SCRYPT_KEYLEN);
  return SCRYPT_PREFIX + derived.toString("hex");
}
function isScryptHash(hash) {
  return typeof hash === "string" && hash.startsWith(SCRYPT_PREFIX);
}
async function verifyPasswordAny(password, salt, storedHash) {
  if (!salt || !storedHash) return false;
  if (isScryptHash(storedHash)) {
    const expected = hashPasswordScrypt(password, salt);
    const expectedBuf = Buffer.from(expected);
    const storedBuf = Buffer.from(storedHash);
    return expectedBuf.length === storedBuf.length && import_crypto.default.timingSafeEqual(expectedBuf, storedBuf);
  }
  return verifyPassword(password, salt, storedHash);
}

// src/server/auth.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error(
    `SESSION_SECRET ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh. \u0110\u1EB7t SESSION_SECRET (m\u1ED9t chu\u1ED7i ng\u1EABu nhi\xEAn d\xE0i) trong .env.local (dev) ho\u1EB7c Vercel Environment Variables (production) \u2014 t\u1EA1o b\u1EB1ng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  );
}
var SESSION_TTL_SECONDS = 12 * 60 * 60;
function base64url(input) {
  return Buffer.from(input).toString("base64url");
}
function signSessionToken(user) {
  const payload = {
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1e3) + SESSION_TTL_SECONDS,
    sid: import_crypto2.default.randomBytes(12).toString("hex")
  };
  const data = base64url(JSON.stringify(payload));
  const signature = import_crypto2.default.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return { token: `${data}.${signature}`, sid: payload.sid };
}
function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = import_crypto2.default.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !import_crypto2.default.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload.exp || Math.floor(Date.now() / 1e3) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
var ROLE_RANK = { Viewer: 0, Editor: 1, Admin: 2 };
function requireAuth(minRole = "Viewer") {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp ho\u1EB7c phi\xEAn \u0111\u0103ng nh\u1EADp \u0111\xE3 h\u1EBFt h\u1EA1n. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i." });
    }
    if (ROLE_RANK[session.role] < ROLE_RANK[minRole]) {
      return res.status(403).json({ error: "T\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n th\u1EF1c hi\u1EC7n h\xE0nh \u0111\u1ED9ng n\xE0y." });
    }
    req.session = session;
    next();
  };
}

// src/server/backupMailer.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var XLSX2 = __toESM(require("xlsx"), 1);

// src/lib/export.ts
var XLSX = __toESM(require("xlsx"), 1);
function buildFullDatabaseWorkbook(payload) {
  const workbook = XLSX.utils.book_new();
  const addSheet = (name, rows) => {
    const sheet = XLSX.utils.json_to_sheet(rows && rows.length > 0 ? rows : [{}]);
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  };
  addSheet("digital_marketing", payload.digital_marketing || []);
  addSheet("kol_koc", payload.kol_koc || []);
  addSheet("btl_trade", payload.btl_trade || []);
  addSheet("monthly_ooh_pr", payload.monthly_ooh_pr || []);
  addSheet("btl_trade_monthly", payload.btl_trade_monthly || []);
  if (payload.comments) {
    const commentRows = [];
    Object.entries(payload.comments).forEach(([week, byBrand]) => {
      Object.entries(byBrand || {}).forEach(([brand, c]) => {
        commentRows.push({ week, brand, field: "evaluation", value: c?.evaluation || "" });
        commentRows.push({ week, brand, field: "proposals", value: c?.proposals || "" });
        Object.entries(c?.categories || {}).forEach(([cat, value]) => {
          commentRows.push({ week, brand, field: `category_${cat}`, value: value || "" });
        });
      });
    });
    addSheet("comments", commentRows);
  }
  if (payload.users) {
    addSheet(
      "users",
      payload.users.map((u) => ({ username: u.username, name: u.name, role: u.role }))
    );
  }
  return workbook;
}

// src/server/backupMailer.ts
function buildBackupAttachmentBuffer(payload) {
  const workbook = buildFullDatabaseWorkbook(payload);
  return XLSX2.write(workbook, { type: "buffer", bookType: "xlsx" });
}
async function sendBackupEmail(config, attachmentBuffer, filename) {
  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    throw new Error("Ch\u01B0a c\u1EA5u h\xECnh \u0111\u1EA7y \u0111\u1EE7 SMTP (host / user / m\u1EADt kh\u1EA9u) \u2014 v\xE0o m\u1EE5c Sao L\u01B0u T\u1EF1 \u0110\u1ED9ng \u0111\u1EC3 thi\u1EBFt l\u1EADp.");
  }
  if (!config.notification_email) {
    throw new Error("Ch\u01B0a c\u1EA5u h\xECnh email nh\u1EADn backup.");
  }
  const port = Number(config.smtp_port) || 587;
  const transporter = import_nodemailer.default.createTransport({
    host: config.smtp_host,
    port,
    secure: port === 465,
    auth: { user: config.smtp_user, pass: config.smtp_pass }
  });
  const todayLabel = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  await transporter.sendMail({
    from: config.smtp_user,
    to: config.notification_email,
    subject: `[Marketing Report] Backup d\u1EEF li\u1EC7u t\u1EF1 \u0111\u1ED9ng \u2014 ${todayLabel}`,
    text: "\u0110\xEDnh k\xE8m l\xE0 b\u1EA3n backup Excel \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a c\u01A1 s\u1EDF d\u1EEF li\u1EC7u B\xE1o C\xE1o Marketing (Livotec & Karofi), bao g\u1ED3m digital_marketing, kol_koc, btl_trade, monthly_ooh_pr, btl_trade_monthly, nh\u1EADn \u0111\u1ECBnh v\xE0 danh s\xE1ch t\xE0i kho\u1EA3n.\n\nEmail n\xE0y \u0111\u01B0\u1EE3c g\u1EEDi t\u1EF1 \u0111\u1ED9ng v\xE0o 17:00 th\u1EE9 S\xE1u h\xE0ng tu\u1EA7n.",
    attachments: [{ filename, content: attachmentBuffer }]
  });
}

// src/server/crypto.ts
var import_crypto3 = __toESM(require("crypto"), 1);
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error(
    "ENCRYPTION_KEY ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh. \u0110\u1EB7t ENCRYPTION_KEY (m\u1ED9t chu\u1ED7i ng\u1EABu nhi\xEAn d\xE0i) trong .env.local (dev) ho\u1EB7c Vercel Environment Variables (production)."
  );
}
var IV_LENGTH = 16;
function encrypt(text) {
  if (!text) return "";
  try {
    const key = import_crypto3.default.createHash("sha256").update(ENCRYPTION_KEY).digest();
    const iv = import_crypto3.default.randomBytes(IV_LENGTH);
    const cipher = import_crypto3.default.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}
function decrypt(text) {
  if (!text) return "";
  if (!text.includes(":")) return text;
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const key = import_crypto3.default.createHash("sha256").update(ENCRYPTION_KEY).digest();
    const decipher = import_crypto3.default.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption error:", err);
    return text;
  }
}

// src/server/socialReport/googleAuth.ts
var import_crypto4 = __toESM(require("crypto"), 1);
var import_youtube = require("@googleapis/youtube");
var CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
var CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
var REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || "";
function isGoogleOAuthConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI);
}
var GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/adwords"
];
function buildOAuth2Client() {
  return new import_youtube.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}
var STATE_TTL_SECONDS = 10 * 60;
function getStateSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh (d\xF9ng chung \u0111\u1EC3 k\xFD state cho lu\u1ED3ng OAuth Google).");
  }
  return secret;
}
function signOAuthState(username) {
  const payload = { username, exp: Math.floor(Date.now() / 1e3) + STATE_TTL_SECONDS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = import_crypto4.default.createHmac("sha256", getStateSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verifyOAuthState(state) {
  if (!state || !state.includes(".")) return null;
  const [data, sig] = state.split(".");
  if (!data || !sig) return null;
  const expected = import_crypto4.default.createHmac("sha256", getStateSecret()).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !import_crypto4.default.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload.exp || Math.floor(Date.now() / 1e3) > payload.exp) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}
function buildGoogleAuthUrl(state) {
  const client = buildOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    // required to get a refresh_token back at all
    prompt: "consent",
    // force the consent screen every time so a refresh_token is re-issued even on a re-connect
    scope: GOOGLE_OAUTH_SCOPES,
    state
  });
}
async function exchangeCodeForTokens(code) {
  const client = buildOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google kh\xF4ng tr\u1EA3 v\u1EC1 refresh_token. Nguy\xEAn nh\xE2n th\u01B0\u1EDDng g\u1EB7p: t\xE0i kho\u1EA3n n\xE0y \u0111\xE3 t\u1EEBng c\u1EA5p quy\u1EC1n tr\u01B0\u1EDBc \u0111\xF3 \u2014 v\xE0o https://myaccount.google.com/permissions, g\u1EE1 quy\u1EC1n c\u1EE7a \u1EE9ng d\u1EE5ng n\xE0y r\u1ED3i th\u1EED k\u1EBFt n\u1ED1i l\u1EA1i."
    );
  }
  return { refreshToken: tokens.refresh_token, scope: tokens.scope || GOOGLE_OAUTH_SCOPES.join(" ") };
}
function saveGoogleTokenIntoState(state, refreshToken, scope, connectedBy) {
  const record = {
    refreshTokenEnc: encrypt(refreshToken),
    scope,
    connectedAt: (/* @__PURE__ */ new Date()).toISOString(),
    connectedBy
  };
  state.oauth = { ...state.oauth || {}, google: record };
}
function isGoogleConnected(state) {
  return Boolean(state.oauth?.google?.refreshTokenEnc);
}
function getAuthorizedClient(state) {
  const record = state.oauth?.google;
  if (!record?.refreshTokenEnc) {
    throw new Error("Ch\u01B0a k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Google. V\xE0o Social Report \u2192 K\u1EBFt n\u1ED1i Google \u0111\u1EC3 c\u1EA5p quy\u1EC1n tr\u01B0\u1EDBc.");
  }
  const client = buildOAuth2Client();
  client.setCredentials({ refresh_token: decrypt(record.refreshTokenEnc) });
  return client;
}
function getDecryptedRefreshToken(state) {
  const record = state.oauth?.google;
  if (!record?.refreshTokenEnc) {
    throw new Error("Ch\u01B0a k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Google.");
  }
  return decrypt(record.refreshTokenEnc);
}

// src/server/socialReport/youtube.ts
var import_youtube2 = require("@googleapis/youtube");
var import_youtubeanalytics = require("@googleapis/youtubeanalytics");
var RECENCY_WINDOW_DAYS = 180;
function getYoutubeChannelId() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "";
  if (!channelId) {
    throw new Error("YOUTUBE_CHANNEL_ID ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh (\u0111\u1EB7t trong .env.local ho\u1EB7c Vercel Environment Variables).");
  }
  return channelId;
}
async function listRecentUploads(auth2, channelId) {
  const youtube = (0, import_youtube2.youtube)({ version: "v3", auth: auth2 });
  const channelRes = await youtube.channels.list({ part: ["contentDetails"], id: [channelId] });
  const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error(
      `Kh\xF4ng t\xECm th\u1EA5y playlist "uploads" cho channel ${channelId}. Ki\u1EC3m tra l\u1EA1i YOUTUBE_CHANNEL_ID.`
    );
  }
  const cutoff = new Date(Date.now() - RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1e3);
  const discovered = [];
  let pageToken = void 0;
  for (let page = 0; page < 5; page++) {
    const res = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken
    });
    let hitCutoff = false;
    for (const item of res.data.items || []) {
      const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
      const videoId = item.contentDetails?.videoId;
      if (!videoId || !publishedAt) continue;
      if (new Date(publishedAt) < cutoff) {
        hitCutoff = true;
        break;
      }
      discovered.push({
        videoId,
        title: item.snippet?.title || videoId,
        publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`
      });
    }
    pageToken = res.data.nextPageToken || void 0;
    if (hitCutoff || !pageToken) break;
  }
  return discovered;
}
var EPOCH_START_DATE = "2005-02-01";
async function fetchVideoAnalytics(auth2, videoIds) {
  if (videoIds.length === 0) return [];
  const youtubeAnalytics = (0, import_youtubeanalytics.youtubeAnalytics)({ version: "v2", auth: auth2 });
  const endDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const filters = `video==${videoIds.join(",")}`;
  const viewsRes = await youtubeAnalytics.reports.query({
    ids: "channel==MINE",
    startDate: EPOCH_START_DATE,
    endDate,
    metrics: "views",
    dimensions: "video,insightTrafficSourceType",
    filters,
    maxResults: 5e3
  });
  const impressionsRes = await youtubeAnalytics.reports.query({
    ids: "channel==MINE",
    startDate: EPOCH_START_DATE,
    endDate,
    metrics: "impressions",
    dimensions: "video",
    filters,
    maxResults: 5e3
  });
  const byVideo = /* @__PURE__ */ new Map();
  for (const id of videoIds) {
    byVideo.set(id, { videoId: id, viewsCumulative: 0, organicViewsCumulative: 0, impressionsCumulative: 0 });
  }
  for (const row of viewsRes.data.rows || []) {
    const [videoId, trafficSource, viewsStr] = row;
    const entry = byVideo.get(videoId);
    if (!entry) continue;
    const views = Number(viewsStr) || 0;
    entry.viewsCumulative += views;
    if (trafficSource !== "ADVERTISING") entry.organicViewsCumulative += views;
  }
  for (const row of impressionsRes.data.rows || []) {
    const [videoId, impressionsStr] = row;
    const entry = byVideo.get(videoId);
    if (!entry) continue;
    entry.impressionsCumulative = Number(impressionsStr) || 0;
  }
  return Array.from(byVideo.values());
}

// src/server/socialReport/googleAds.ts
var import_google_ads_api = require("google-ads-api");
function isGoogleAdsConfigured() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_ADS_DEVELOPER_TOKEN && process.env.GOOGLE_ADS_CUSTOMER_ID
  );
}
function toGaqlDate(d) {
  return d.toISOString().slice(0, 10);
}
function gaqlEscape(value) {
  return value.replace(/'/g, "\\'");
}
async function fetchVideoAdSpend(refreshToken, videoIds, rangeStart, rangeEnd) {
  if (videoIds.length === 0) return [];
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || "";
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || void 0;
  const client = new import_google_ads_api.GoogleAdsApi({ client_id: clientId, client_secret: clientSecret, developer_token: developerToken });
  const customer = client.Customer({ customer_id: customerId, login_customer_id: loginCustomerId, refresh_token: refreshToken });
  const idList = videoIds.map((id) => `'${gaqlEscape(id)}'`).join(",");
  const query = `
    SELECT video.id, metrics.impressions, metrics.cost_micros, segments.date, customer.currency_code
    FROM video
    WHERE video.id IN (${idList})
      AND segments.date BETWEEN '${toGaqlDate(rangeStart)}' AND '${toGaqlDate(rangeEnd)}'
  `;
  const rows = await customer.query(query);
  const weekEnding = toGaqlDate(rangeEnd);
  const byVideo = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const videoId = row.video?.id;
    if (!videoId) continue;
    const costMicros = Number(row.metrics?.cost_micros || 0);
    const impressions = Number(row.metrics?.impressions || 0);
    const currency = row.customer?.currency_code || "VND";
    const existing = byVideo.get(videoId);
    if (existing) {
      existing.spend += costMicros / 1e6;
      existing.impressions += impressions;
    } else {
      byVideo.set(videoId, {
        platform: "youtube",
        videoId,
        weekEnding,
        spend: costMicros / 1e6,
        currency,
        impressions
      });
    }
  }
  return Array.from(byVideo.values());
}

// src/server/socialReport/syncEngine.ts
function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}
async function runSync(state) {
  const log = [];
  const now = /* @__PURE__ */ new Date();
  const today = toIsoDate(now);
  const auth2 = getAuthorizedClient(state);
  const channelId = getYoutubeChannelId();
  log.push(`[${today}] B\u1EAFt \u0111\u1EA7u \u0111\u1ED3ng b\u1ED9.`);
  const videos = await listRecentUploads(auth2, channelId);
  log.push(`T\xECm th\u1EA5y ${videos.length} video \u0111\xE3 \u0111\u0103ng trong ~6 th\xE1ng g\u1EA7n \u0111\xE2y.`);
  if (videos.length === 0) {
    log.push("Kh\xF4ng c\xF3 video n\xE0o \u0111\u1EC3 \u0111\u1ED3ng b\u1ED9 \u2014 d\u1EEBng l\u1EA1i.");
    return { ok: true, log, snapshotsAdded: 0, paidRowsAdded: 0 };
  }
  const videoIds = videos.map((v) => v.videoId);
  const analytics = await fetchVideoAnalytics(auth2, videoIds);
  const analyticsByVideo = new Map(analytics.map((a) => [a.videoId, a]));
  const existingSnapshots = state.snapshots.filter(
    (s) => !(s.snapshotDate === today && videoIds.includes(s.videoId))
  );
  const newSnapshots = videos.map((v) => {
    const a = analyticsByVideo.get(v.videoId);
    return {
      platform: "youtube",
      videoId: v.videoId,
      title: v.title,
      videoUrl: v.videoUrl,
      publishedAt: v.publishedAt,
      snapshotDate: today,
      viewsCumulative: a?.viewsCumulative ?? 0,
      organicViewsCumulative: a?.organicViewsCumulative ?? 0,
      impressionsCumulative: a?.impressionsCumulative ?? 0
    };
  });
  state.snapshots = [...existingSnapshots, ...newSnapshots];
  log.push(`\u0110\xE3 l\u01B0u ${newSnapshots.length} d\xF2ng snapshot organic (ng\xE0y ${today}).`);
  let paidRowsAdded = 0;
  if (isGoogleAdsConfigured()) {
    try {
      const rangeEnd = now;
      const rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const refreshToken = getDecryptedRefreshToken(state);
      const spendRows = await fetchVideoAdSpend(refreshToken, videoIds, rangeStart, rangeEnd);
      const weekEnding = toIsoDate(rangeEnd);
      const existingPaid = state.paidSpend.filter(
        (p) => !(p.weekEnding === weekEnding && videoIds.includes(p.videoId))
      );
      state.paidSpend = [...existingPaid, ...spendRows];
      paidRowsAdded = spendRows.length;
      log.push(`\u0110\xE3 l\u1EA5y chi ti\xEAu Google Ads cho ${spendRows.length}/${videos.length} video (tu\u1EA7n k\u1EBFt th\xFAc ${weekEnding}).`);
    } catch (err) {
      log.push(`\u26A0 L\u1ED7i khi l\u1EA5y d\u1EEF li\u1EC7u Google Ads: ${err.message || err}. Ph\u1EA7n organic v\u1EABn \u0111\u01B0\u1EE3c l\u01B0u b\xECnh th\u01B0\u1EDDng.`);
    }
  } else {
    log.push("Google Ads ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh (thi\u1EBFu GOOGLE_ADS_DEVELOPER_TOKEN/GOOGLE_ADS_CUSTOMER_ID) \u2014 b\u1ECF qua ph\u1EA7n chi ti\xEAu.");
  }
  state.lastSyncedAt = now.toISOString();
  state.lastSyncLog = log.slice(-50);
  return { ok: true, log, snapshotsAdded: newSnapshots.length, paidRowsAdded };
}
function computeWeeklyReport(state) {
  const byVideo = /* @__PURE__ */ new Map();
  for (const snap of state.snapshots) {
    const list = byVideo.get(snap.videoId) || [];
    list.push(snap);
    byVideo.set(snap.videoId, list);
  }
  const rows = [];
  for (const snaps of byVideo.values()) {
    const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      const prev = i > 0 ? sorted[i - 1] : null;
      const weeklyViews = prev ? cur.viewsCumulative - prev.viewsCumulative : cur.viewsCumulative;
      const weeklyOrganicViews = prev ? cur.organicViewsCumulative - prev.organicViewsCumulative : cur.organicViewsCumulative;
      const weeklyImpressions = prev ? cur.impressionsCumulative - prev.impressionsCumulative : cur.impressionsCumulative;
      const weekSpend = sumSpend(state.paidSpend, cur.videoId, (p) => p.weekEnding === cur.snapshotDate);
      const spendYtd = sumSpend(state.paidSpend, cur.videoId, (p) => p.weekEnding <= cur.snapshotDate);
      rows.push({
        ...cur,
        weeklyViews,
        weeklyOrganicViews,
        weeklyImpressions,
        weekSpend,
        spendYtd,
        hasAds: spendYtd > 0
      });
    }
  }
  return rows.sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate));
}
function sumSpend(paidSpend, videoId, predicate) {
  return paidSpend.filter((p) => p.videoId === videoId && predicate(p)).reduce((sum, p) => sum + p.spend, 0);
}

// src/server/socialReport/types.ts
function emptySocialReportState() {
  return { snapshots: [], paidSpend: [], lastSyncedAt: null, lastSyncLog: [] };
}

// src/server/socialReport/routes.ts
function readSocialReportState(fullStore) {
  return fullStore.social_report ? { ...emptySocialReportState(), ...fullStore.social_report } : emptySocialReportState();
}
async function withState(deps, fn, persist) {
  const fullStore = await deps.getDatabaseData();
  const state = readSocialReportState(fullStore);
  const result = await fn(state);
  if (persist) {
    fullStore.social_report = state;
    await deps.saveDatabaseData(fullStore);
  }
  return result;
}
function registerSocialReportRoutes(app2, deps) {
  app2.get("/api/social-report/status", requireAuth("Admin"), async (_req, res) => {
    try {
      let channelIdConfigured = true;
      try {
        getYoutubeChannelId();
      } catch {
        channelIdConfigured = false;
      }
      const status = await withState(
        deps,
        async (state) => ({
          googleOAuthConfigured: isGoogleOAuthConfigured(),
          channelIdConfigured,
          googleAdsConfigured: isGoogleAdsConfigured(),
          connected: isGoogleConnected(state),
          connectedAt: state.oauth?.google?.connectedAt || null,
          connectedBy: state.oauth?.google?.connectedBy || null,
          lastSyncedAt: state.lastSyncedAt,
          lastSyncLog: state.lastSyncLog,
          videoCount: new Set(state.snapshots.map((s) => s.videoId)).size
        }),
        false
      );
      return res.json({ success: true, status });
    } catch (err) {
      return res.status(500).json({ error: err.message || "L\u1ED7i \u0111\u1ECDc tr\u1EA1ng th\xE1i Social Report." });
    }
  });
  app2.get("/api/social-report/oauth/google/start", requireAuth("Admin"), async (req, res) => {
    try {
      if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({
          error: "Ch\u01B0a c\u1EA5u h\xECnh GOOGLE_OAUTH_CLIENT_ID/GOOGLE_OAUTH_CLIENT_SECRET/GOOGLE_OAUTH_REDIRECT_URI."
        });
      }
      const session = req.session;
      const state = signOAuthState(session.username);
      const authUrl = buildGoogleAuthUrl(state);
      return res.json({ success: true, authUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message || "L\u1ED7i t\u1EA1o \u0111\u01B0\u1EDDng d\u1EABn x\xE1c th\u1EF1c Google." });
    }
  });
  app2.get("/api/social-report/oauth/google/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) {
      return res.redirect(`/?social_oauth=error&message=${encodeURIComponent(String(error))}`);
    }
    const verified = verifyOAuthState(state);
    if (!verified) {
      return res.redirect(`/?social_oauth=error&message=${encodeURIComponent("Phi\xEAn x\xE1c th\u1EF1c \u0111\xE3 h\u1EBFt h\u1EA1n, vui l\xF2ng th\u1EED l\u1EA1i.")}`);
    }
    if (!code) {
      return res.redirect(`/?social_oauth=error&message=${encodeURIComponent("Thi\u1EBFu m\xE3 x\xE1c th\u1EF1c t\u1EEB Google.")}`);
    }
    try {
      const { refreshToken, scope } = await exchangeCodeForTokens(String(code));
      await withState(
        deps,
        async (socialState) => {
          saveGoogleTokenIntoState(socialState, refreshToken, scope, verified.username);
        },
        true
      );
      return res.redirect("/?social_oauth=success");
    } catch (err) {
      return res.redirect(`/?social_oauth=error&message=${encodeURIComponent(err.message || "L\u1ED7i k\u1EBFt n\u1ED1i Google.")}`);
    }
  });
  app2.post("/api/social-report/sync", requireAuth("Admin"), async (_req, res) => {
    try {
      const result = await withState(deps, (state) => runSync(state), true);
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(500).json({ error: err.message || "L\u1ED7i \u0111\u1ED3ng b\u1ED9 Social Report." });
    }
  });
  app2.get("/api/social-report/data", requireAuth("Admin"), async (_req, res) => {
    try {
      const { rows, lastSyncedAt } = await withState(
        deps,
        async (state) => ({ rows: computeWeeklyReport(state), lastSyncedAt: state.lastSyncedAt }),
        false
      );
      return res.json({ success: true, rows, lastSyncedAt });
    } catch (err) {
      return res.status(500).json({ error: err.message || "L\u1ED7i \u0111\u1ECDc d\u1EEF li\u1EC7u Social Report." });
    }
  });
  app2.get("/api/cron/social-report-sync", async (req, res) => {
    try {
      const expected = process.env.CRON_SECRET;
      if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await withState(deps, (state) => runSync(state), true);
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error("GET /api/cron/social-report-sync error:", err);
      return res.status(500).json({ error: err.message || "L\u1ED7i \u0111\u1ED3ng b\u1ED9 \u0111\u1ECBnh k\u1EF3 Social Report." });
    }
  });
}

// src/server/app.ts
import_dotenv2.default.config({ path: ".env.local", quiet: true });
import_dotenv2.default.config({ quiet: true });
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "20mb" }));
var LOGIN_MAX_ATTEMPTS = 5;
var LOGIN_WINDOW_SECONDS = 15 * 60;
var LOGIN_LOCKOUT_SECONDS = 15 * 60;
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (first) return first.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}
function loginAttemptKey(req, username) {
  return `${getClientIp(req)}|${username.trim().toLowerCase()}`;
}
var localLoginAttempts = /* @__PURE__ */ new Map();
var localLoginLogId = 1;
var localLoginLogs = [];
var localActionLogId = 1;
var localActionLogs = [];
async function getLoginLockout(key) {
  if (!isSupabaseConfigured) {
    const rec = localLoginAttempts.get(key);
    if (!rec?.lockedUntil) return null;
    return rec.lockedUntil > Date.now() ? new Date(rec.lockedUntil) : null;
  }
  const { data, error } = await supabase.from("login_attempts").select("locked_until").eq("key", key).maybeSingle();
  if (error || !data?.locked_until) return null;
  const lockedUntil = new Date(data.locked_until);
  return lockedUntil.getTime() > Date.now() ? lockedUntil : null;
}
async function recordLoginFailure(key) {
  if (!isSupabaseConfigured) {
    const now = Date.now();
    const existing = localLoginAttempts.get(key);
    const windowExpired = !existing || now - existing.windowStartedAt > LOGIN_WINDOW_SECONDS * 1e3;
    const rec = windowExpired ? { failCount: 1, windowStartedAt: now, lockedUntil: null } : { ...existing, failCount: existing.failCount + 1 };
    if (rec.failCount >= LOGIN_MAX_ATTEMPTS) rec.lockedUntil = now + LOGIN_LOCKOUT_SECONDS * 1e3;
    localLoginAttempts.set(key, rec);
    return rec.failCount;
  }
  const { data, error } = await supabase.rpc("record_login_failure", {
    p_key: key,
    p_window_seconds: LOGIN_WINDOW_SECONDS,
    p_max_attempts: LOGIN_MAX_ATTEMPTS,
    p_lockout_seconds: LOGIN_LOCKOUT_SECONDS
  });
  if (error) {
    console.error("record_login_failure error:", error.message);
    return 1;
  }
  return data?.[0]?.fail_count ?? 1;
}
async function resetLoginAttempts(key) {
  if (!isSupabaseConfigured) {
    localLoginAttempts.delete(key);
    return;
  }
  const { error } = await supabase.rpc("reset_login_attempts", { p_key: key });
  if (error) console.error("reset_login_attempts error:", error.message);
}
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function getUserAgent(req) {
  return req.headers["user-agent"] || "unknown";
}
async function logLoginAttempt(username, status, req, sessionId) {
  if (!isSupabaseConfigured) {
    localLoginLogs.unshift({
      id: localLoginLogId++,
      username: username.trim().toLowerCase(),
      status,
      ip: getClientIp(req),
      user_agent: getUserAgent(req),
      session_id: sessionId,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return;
  }
  const { error } = await supabase.from("login_logs").insert({
    username: username.trim().toLowerCase(),
    status,
    ip: getClientIp(req),
    user_agent: getUserAgent(req),
    session_id: sessionId
  });
  if (error) console.error("logLoginAttempt error:", error.message);
}
async function logAction(session, req, action, details) {
  if (!isSupabaseConfigured) {
    localActionLogs.unshift({
      id: localActionLogId++,
      username: session.username,
      role: session.role,
      action,
      details: details ?? null,
      ip: getClientIp(req),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return;
  }
  const { error } = await supabase.from("action_logs").insert({
    username: session.username,
    role: session.role,
    action,
    details: details ?? null,
    ip: getClientIp(req)
  });
  if (error) console.error("logAction error:", error.message);
}
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 t\xEAn \u0111\u0103ng nh\u1EADp v\xE0 m\u1EADt kh\u1EA9u." });
    }
    const attemptKey = loginAttemptKey(req, String(username));
    const existingLockout = await getLoginLockout(attemptKey);
    if (existingLockout) {
      const minutesLeft = Math.max(1, Math.ceil((existingLockout.getTime() - Date.now()) / 6e4));
      return res.status(429).json({
        error: `T\xE0i kho\u1EA3n t\u1EA1m th\u1EDDi b\u1ECB kh\xF3a do \u0111\u0103ng nh\u1EADp sai qu\xE1 nhi\u1EC1u l\u1EA7n. Vui l\xF2ng th\u1EED l\u1EA1i sau kho\u1EA3ng ${minutesLeft} ph\xFAt.`
      });
    }
    const store = await getDatabaseData();
    const storedUsers = Array.isArray(store.users) ? store.users : [];
    const allUsers = reconcileUsers(storedUsers, -1);
    const candidate = allUsers.find((u) => u.username.toLowerCase() === String(username).trim().toLowerCase());
    const ok = candidate?.passwordHash && candidate?.salt ? await verifyPasswordAny(String(password), candidate.salt, candidate.passwordHash) : false;
    if (!candidate || !ok) {
      const failCount = await recordLoginFailure(attemptKey);
      await logLoginAttempt(String(username), "failure", req, null);
      await sleep(Math.min(failCount * 1e3, 8e3));
      return res.status(401).json({ error: "T\xEAn \u0111\u0103ng nh\u1EADp ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." });
    }
    await resetLoginAttempts(attemptKey);
    if (candidate.passwordHash && !isScryptHash(candidate.passwordHash)) {
      const migratedHash = hashPasswordScrypt(String(password), candidate.salt);
      const migratedUsers = storedUsers.map(
        (u) => u.username.toLowerCase() === candidate.username.toLowerCase() ? { ...u, passwordHash: migratedHash } : u
      );
      store.users = migratedUsers;
      await saveDatabaseData(store).catch((err) => console.error("Login hash migration save failed:", err));
    }
    const { token, sid } = signSessionToken(candidate);
    await logLoginAttempt(candidate.username, "success", req, sid);
    return res.json({
      success: true,
      token,
      user: { username: candidate.username, name: candidate.name, role: candidate.role }
    });
  } catch (err) {
    console.error("POST /api/login error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u0103ng nh\u1EADp: ${err.message}` });
  }
});
var INITIAL_DATA_PATH = import_path.default.join(process.cwd(), "src", "initial_data.json");
var LOCAL_DB_PATH = import_path.default.join(process.cwd(), "src", "db_store.json");
function readInitialSeed() {
  try {
    const raw = import_fs.default.readFileSync(INITIAL_DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read initial_data.json:", err);
    return { digital_marketing: [], kol_koc: [], btl_trade: [], monthly_ooh_pr: [] };
  }
}
async function getDatabaseData() {
  if (!isSupabaseConfigured) {
    try {
      return JSON.parse(import_fs.default.readFileSync(LOCAL_DB_PATH, "utf8"));
    } catch {
      const seed2 = readInitialSeed();
      await saveDatabaseData(seed2);
      return seed2;
    }
  }
  const { data, error } = await supabase.from("app_state").select("data").eq("id", APP_STATE_ROW_ID).maybeSingle();
  if (error) {
    throw new Error(`L\u1ED7i \u0111\u1ECDc d\u1EEF li\u1EC7u t\u1EEB Supabase: ${error.message}`);
  }
  if (data?.data) {
    return data.data;
  }
  const seed = readInitialSeed();
  await saveDatabaseData(seed);
  return seed;
}
async function saveDatabaseData(fullData) {
  if (!isSupabaseConfigured) {
    import_fs.default.writeFileSync(LOCAL_DB_PATH, JSON.stringify(fullData, null, 2), "utf8");
    return;
  }
  const { error } = await supabase.from("app_state").upsert({ id: APP_STATE_ROW_ID, data: fullData, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
  if (error) {
    throw new Error(`L\u1ED7i ghi d\u1EEF li\u1EC7u v\xE0o Supabase: ${error.message}`);
  }
}
var ai = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder value.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}
app.post("/api/fetch-drive", requireAuth("Editor"), async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p link Google Drive" });
    }
    const regId1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const regId2 = /[?&]id=([a-zA-Z0-9_-]+)/;
    let fileId = "";
    const match1 = url.match(regId1);
    const match2 = url.match(regId2);
    if (match1 && match1[1]) {
      fileId = match1[1];
    } else if (match2 && match2[1]) {
      fileId = match2[1];
    } else {
      fileId = url.trim();
    }
    if (url.includes("/folders/")) {
      return res.status(400).json({ error: "\u0110\u01B0\u1EDDng d\u1EABn b\u1EA1n cung c\u1EA5p l\xE0 Th\u01B0 m\u1EE5c (Folder). Vui l\xF2ng cung c\u1EA5p link c\u1EE7a m\u1ED9t t\u1EC7p tin (File) JSON c\u1EE5 th\u1EC3 \u1EDF ch\u1EBF \u0111\u1ED9 c\xF4ng khai." });
    }
    if (!fileId || fileId.length < 10) {
      return res.status(400).json({ error: "Kh\xF4ng t\xECm th\u1EA5y ID t\u1EC7p Google Drive h\u1EE3p l\u1EC7 t\u1EEB \u0111\u01B0\u1EDDng d\u1EABn." });
    }
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    console.log(`Attempting to fetch Google Drive file ID: ${fileId} from ${downloadUrl}`);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Google Drive tr\u1EA3 v\u1EC1 m\xE3 l\u1ED7i: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    if (text.includes("<!DOCTYPE html>") || text.includes("<html") || text.includes("google.com/accounts/Login")) {
      return res.status(401).json({
        error: "Kh\xF4ng th\u1EC3 t\u1EA3i tr\u1EF1c tuy\u1EBFn. T\u1EC7p Google Drive ph\u1EA3i \u0111\u01B0\u1EE3c chia s\u1EBB \u1EDF ch\u1EBF \u0111\u1ED9 'B\u1EA5t k\u1EF3 ai c\xF3 \u0111\u01B0\u1EDDng link \u0111\u1EC1u c\xF3 th\u1EC3 xem' (Anyone with link can view). Vui l\xF2ng ki\u1EC3m tra l\u1EA1i quy\u1EC1n chia s\u1EBB tr\xEAn Google Drive ho\u1EB7c copy-paste th\u1EE7 c\xF4ng."
      });
    }
    try {
      const jsonData = JSON.parse(text);
      await logAction(req.session, req, "fetch-drive", `T\u1EA3i t\u1EC7p t\u1EEB Google Drive (fileId: ${fileId})`);
      return res.json({ success: true, data: jsonData });
    } catch (parseError) {
      console.error("Failed to parse fetched content as JSON. Head:", text.substring(0, 200));
      return res.status(422).json({
        error: "T\u1EA3i t\u1EC7p th\xE0nh c\xF4ng nh\u01B0ng n\u1ED9i dung t\u1EC7p kh\xF4ng ph\u1EA3i \u0111\u1ECBnh d\u1EA1ng JSON h\u1EE3p l\u1EC7. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i c\u1EA5u tr\xFAc file.",
        preview: text.substring(0, 200)
      });
    }
  } catch (error) {
    console.error("Fetch Drive error:", error);
    return res.status(500).json({ error: `L\u1ED7i k\u1EBFt n\u1ED1i t\u1EC7p: ${error.message || error}` });
  }
});
app.post("/api/analyze", requireAuth("Editor"), async (req, res) => {
  try {
    const { data, brand } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u \u0111\u1EA7u v\xE0o \u0111\u1EC3 ph\xE2n t\xEDch." });
    }
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API ch\u01B0a \u0111\u01B0\u1EE3c \u0111\u1ECBnh c\u1EA5u h\xECnh. B\u1EA1n h\xE3y c\u1EA5u h\xECnh GEMINI_API_KEY trong ph\u1EA7n Secrets, ho\u1EB7c s\u1EED d\u1EE5ng c\xE1c b\u1EA3n bi\xEAn t\u1EADp th\u1EE7 c\xF4ng c\u1EF1c k\u1EF3 chi ti\u1EBFt c\xF3 s\u1EB5n."
      });
    }
    const brandName = brand || "Livotec";
    const dataString = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const prompt = `B\u1EA1n l\xE0 m\u1ED9t Chuy\xEAn gia Ph\xE2n t\xEDch D\u1EEF li\u1EC7u Marketing (Marketing Data Analyst) chuy\xEAn nghi\u1EC7p.
H\xE3y \u0111\u1ECDc v\xE0 ph\xE2n t\xEDch chuy\xEAn s\xE2u b\xE1o c\xE1o chi\u1EBFn d\u1ECBch tu\u1EA7n n\xE0y c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u "${brandName}" d\u1EF1a tr\xEAn d\u1EEF li\u1EC7u JSON \u0111\u01B0\u1EE3c cung c\u1EA5p d\u01B0\u1EDBi \u0111\xE2y.

D\u01B0\u1EDBi \u0111\xE2y l\xE0 d\u1EEF li\u1EC7u b\xE1o c\xE1o chi\u1EBFn d\u1ECBch:
${dataString}

Y\xCAU C\u1EA6U:
H\xE3y xu\u1EA5t ra nh\u1EADn \u0111\u1ECBnh ph\xE2n t\xEDch b\u1EB1ng ti\u1EBFng Vi\u1EC7t theo c\u1EA5u tr\xFAc JSON \u0111\u1ECBnh d\u1EA1ng ch\xEDnh x\xE1c sau \u0111\xE2y. C\xE1c nh\u1EADn x\xE9t c\u1EA7n chuy\xEAn s\xE2u, k\u1EBFt h\u1EE3p c\xE1c con s\u1ED1 th\u1EF1c t\u1EBF c\xF3 trong d\u1EEF li\u1EC7u (v\xED d\u1EE5: s\u1ED1 b\xE0i vi\u1EBFt, chi ph\xED \u0111\xE3 ti\xEAu, impressions, reach, CPM, organic traffic...) v\xE0 \u0111\u01B0a ra ph\xE2n t\xEDch s\u1EAFc b\xE9n, l\u1EDDi khuy\xEAn th\u1EF1c t\u1EBF nh\u1EA5t.

C\u1EA5u tr\xFAc JSON ph\u1EA3n h\u1ED3i b\u1EAFt bu\u1ED9c ph\u1EA3i \u0111\xFAng 100% m\u1EABu d\u01B0\u1EDBi \u0111\xE2y, kh\xF4ng ch\u1EE9a b\u1EA5t k\u1EF3 v\u0103n b\u1EA3n n\xE0o kh\xE1c ngo\xE0i JSON (kh\xF4ng b\u1ECDc trong d\u1EA5u markdown \`\`\`json):
{
  "executiveSummary": {
    "evaluation": "Nh\u1EADn x\xE9t t\u1ED5ng quan c\u1EF1c k\u1EF3 chi ti\u1EBFt, \u0111\xE1nh gi\xE1 kh\xE1ch quan v\u1EC1 th\u1EF1c tr\u1EA1ng tri\u1EC3n khai trong tu\u1EA7n (nh\u1EEFng \u0111i\u1EC3m s\xE1ng v\xE0 h\u1EA1n ch\u1EBF c\u1EE5 th\u1EC3 c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u ${brandName}). S\u1EED d\u1EE5ng s\u1ED1 li\u1EC7u ch\u1EE9ng minh t\u1EEB c\xE1c m\u1EA3ng SEO, Ads, Content, SOV.",
    "proposals": "C\xE1c \u0111\u1EC1 xu\u1EA5t c\u1EE5 th\u1EC3, h\xE0nh \u0111\u1ED9ng thi\u1EBFt th\u1EF1c cho tu\u1EA7n k\u1EBF ti\u1EBFp \u0111\u1EC3 t\u1ED1i \u01B0u h\xF3a hi\u1EC7u qu\u1EA3 (\u0111\u01B0a ra \xEDt nh\u1EA5t 3 \u0111\u1EC1 xu\u1EA5t ng\u1EAFn g\u1ECDn, tr\u1EF1c di\u1EC7n)."
  },
  "categoryAnalysis": {
    "sov": "Nh\u1EADn x\xE9t ph\xE2n t\xEDch ng\u1EAFn g\u1ECDn, s\xFAc t\xEDch k\xE8m s\u1ED1 li\u1EC7u v\u1EC1 th\u1ECB ph\u1EA7n th\u1EA3o lu\u1EADn (Share of Voice) c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u ${brandName} so v\u1EDBi c\xE1c \u0111\u1ED1i th\u1EE7 c\u1EA1nh tranh nh\u01B0 Karofi, Kangaroo, Sunhouse, H\xF2a Ph\xE1t...",
    "kol_koc": "Nh\u1EADn x\xE9t v\u1EC1 vi\u1EC7c tri\u1EC3n khai KOL/KOC trong tu\u1EA7n c\u1EE7a ${brandName}. \u0110\u1ED1i chi\u1EBFu KPI to\xE0n chi\u1EBFn d\u1ECBch, t\xEDch l\u0169y chi\u1EBFn d\u1ECBch v\xE0 s\u1ED1 th\u1EF1c hi\u1EC7n tu\u1EA7n n\xE0y.",
    "content": "Nh\u1EADn x\xE9t v\u1EC1 ho\u1EA1t \u0111\u1ED9ng s\u1EA3n xu\u1EA5t, xu\u1EA5t b\u1EA3n c\xE1c \u1EA5n ph\u1EA9m Content & S\xE1ng t\u1EA1o n\u1ED9i dung (v\xED d\u1EE5: s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt \u0111\u0103ng t\u1EA3i, clip gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m, ooh/led, c\xE1c n\u1ED9i dung social media kh\xE1c) trong tu\u1EA7n c\u1EE7a ${brandName}.",
    "tvc": "Ph\xE2n t\xEDch v\xE0 nh\u1EADn x\xE9t chi ti\u1EBFt v\u1EC1 hi\u1EC7u qu\u1EA3 ph\xE1t s\xF3ng TVC (ch\u1EC9 s\u1ED1 metric l\xE0 GRPS) tr\xEAn c\xE1c k\xEAnh truy\u1EC1n h\xECnh t\u1EA1i c\xE1c th\xE0nh ph\u1ED1/k\xEAnh s\xF3ng tr\u1ECDng \u0111i\u1EC3m c\u1EE7a ${brandName} nh\u01B0 HAN, HCM, CAN, HTV & THVL.",
    "pr": "Nh\u1EADn x\xE9t chi ti\u1EBFt v\u1EC1 hi\u1EC7u qu\u1EA3 ho\u1EA1t \u0111\u1ED9ng PR b\xE1o ch\xED c\u1EE7a ${brandName} trong tu\u1EA7n ho\u1EB7c trong th\xE1ng (\u0111\u1ED1i chi\u1EBFu l\u01B0\u1EE3ng b\xE0i vi\u1EBFt Quantity v\xE0 l\u01B0\u1EE3ng ng\u01B0\u1EDDi ti\u1EBFp c\u1EADn Views c\u1EE7a b\xE0i vi\u1EBFt).",
    "ooh": "Nh\u1EADn x\xE9t chi ti\u1EBFt ho\u1EA1t \u0111\u1ED9ng truy\u1EC1n th\xF4ng ngo\xE0i tr\u1EDDi OOH c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u ${brandName} theo c\xE1c ph\xE2n kh\xFAc: LCD Building, LED Cities, LED Airport, Pano.",
    "paid_ads": "Ph\xE2n t\xEDch hi\u1EC7u qu\u1EA3 Paid Ads trong tu\u1EA7n (v\u1EC1 Amount spent, Impressions, Reach, CPM, Frequency), \u0111\xE1nh gi\xE1 m\u1EE9c \u0111\u1ED9 ph\u1EE7 th\u01B0\u01A1ng hi\u1EC7u v\xE0 t\u1ED1i \u01B0u chi ph\xED.",
    "seo": "Ph\xE2n t\xEDch hi\u1EC7u qu\u1EA3 SEO Website & SEO Content trong tu\u1EA7n (Traffic Organic, Impressions Organic, s\u1ED1 l\u01B0\u1EE3ng b\xE0i vi\u1EBFt). So s\xE1nh th\u1EF1c t\u1EBF \u0111\u1EA1t \u0111\u01B0\u1EE3c so v\u1EDBi m\u1EE5c ti\xEAu \u0111\u1EC1 ra.",
    "btl_trade": "\u0110\xE1nh gi\xE1 chi ti\u1EBFt ho\u1EA1t \u0111\u1ED9ng BTL & Trade Marketing c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u ${brandName} (bi\u1EC3n b\u1EA3ng POSM, qu\u1EA7y k\u1EC7, ki\u1EC3m so\xE1t h\xECnh \u1EA3nh \u0111i\u1EC3m b\xE1n, s\u1EF1 ki\u1EC7n activation/workshop). So s\xE1nh k\u1EBF ho\u1EA1ch th\xE1ng 6, l\u0169y k\u1EBF \u0111\u1EA1t \u0111\u01B0\u1EE3c v\xE0 \u0111\u1ED1i chi\u1EBFu t\u0103ng tr\u01B0\u1EDFng so v\u1EDBi th\u1EF1c t\u1EBF th\u1EF1c hi\u1EC7n th\xE1ng 5."
  }
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "";
    try {
      const parsed = JSON.parse(text.trim());
      await logAction(req.session, req, "analyze", `Ph\xE2n t\xEDch AI cho th\u01B0\u01A1ng hi\u1EC7u ${brandName}`);
      return res.json({ success: true, analysis: parsed });
    } catch (e) {
      console.error("Gemini raw text parse failure:", text);
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          const parsedFixed = JSON.parse(text.substring(start, end + 1));
          return res.json({ success: true, analysis: parsedFixed });
        } catch (innerErr) {
          throw new Error("Kh\xF4ng th\u1EC3 ph\xE2n t\xEDch ph\u1EA3n h\u1ED3i JSON t\u1EEB AI.");
        }
      }
      throw new Error("Ph\u1EA3n h\u1ED3i c\u1EE7a AI kh\xF4ng \u0111\xFAng \u0111\u1ECBnh d\u1EA1ng JSON.");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error.message || "L\u1ED7i x\u1EED l\xFD ph\xE2n t\xEDch AI" });
  }
});
app.get("/api/get-mail-config", requireAuth("Admin"), async (req, res) => {
  try {
    const store = await getDatabaseData();
    const config = store.mail_config || {};
    const decryptedPass = config.smtp_pass ? decrypt(config.smtp_pass) : "";
    res.json({
      success: true,
      config: {
        smtp_host: config.smtp_host || "",
        smtp_port: config.smtp_port || "587",
        smtp_user: config.smtp_user || "",
        smtp_pass: decryptedPass,
        notification_email: config.notification_email || "ntkdung1206@gmail.com",
        enabled: config.enabled !== void 0 ? config.enabled : true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/save-mail-config", requireAuth("Admin"), async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, notification_email, enabled } = req.body;
    const store = await getDatabaseData();
    const encryptedPass = smtp_pass ? encrypt(smtp_pass) : "";
    store.mail_config = {
      smtp_host: smtp_host || "",
      smtp_port: smtp_port || "587",
      smtp_user: smtp_user || "",
      smtp_pass: encryptedPass,
      notification_email: notification_email || "",
      enabled: enabled === true
    };
    await saveDatabaseData(store);
    await logAction(req.session, req, "save-mail-config", "C\u1EADp nh\u1EADt c\u1EA5u h\xECnh g\u1EEDi mail SMTP");
    res.json({ success: true, message: "C\u1EA5u h\xECnh g\u1EEDi mail t\u1EF1 \u0111\u1ED9ng \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u v\xE0 m\xE3 h\xF3a b\u1EA3o m\u1EADt!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
async function runDatabaseBackupEmail() {
  const store = await getDatabaseData();
  const config = store.mail_config || {};
  const normalized = normalizeMarketingData(store);
  const safeUsers = (Array.isArray(store.users) ? store.users : []).map((u) => ({
    username: u.username,
    name: u.name,
    role: u.role
  }));
  const buffer = buildBackupAttachmentBuffer({
    ...normalized,
    comments: store.comments || {},
    users: safeUsers
  });
  await sendBackupEmail(
    {
      smtp_host: config.smtp_host || "",
      smtp_port: config.smtp_port || "587",
      smtp_user: config.smtp_user || "",
      smtp_pass: config.smtp_pass ? decrypt(config.smtp_pass) : "",
      notification_email: config.notification_email || "",
      enabled: config.enabled !== false
    },
    buffer,
    `marketing_backup_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`
  );
}
app.post("/api/send-backup-now", requireAuth("Admin"), async (req, res) => {
  try {
    await runDatabaseBackupEmail();
    await logAction(req.session, req, "send-backup-now", "G\u1EEDi th\u1EED email backup database");
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-backup-now error:", err);
    return res.status(500).json({ error: err.message || "L\u1ED7i g\u1EEDi email backup." });
  }
});
app.get("/api/cron/weekly-backup", async (req, res) => {
  try {
    const expected = process.env.CRON_SECRET;
    if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const store = await getDatabaseData();
    if (store.mail_config?.enabled === false) {
      return res.json({ success: true, skipped: true, reason: "G\u1EEDi mail t\u1EF1 \u0111\u1ED9ng \u0111ang t\u1EAFt (enabled=false)." });
    }
    await runDatabaseBackupEmail();
    return res.json({ success: true });
  } catch (err) {
    console.error("GET /api/cron/weekly-backup error:", err);
    return res.status(500).json({ error: err.message || "L\u1ED7i g\u1EEDi email backup \u0111\u1ECBnh k\u1EF3." });
  }
});
app.get("/api/get-data", requireAuth(), async (req, res) => {
  try {
    const rawDbData = await getDatabaseData();
    const normalized = normalizeMarketingData(rawDbData);
    return res.json({
      success: true,
      data: normalized,
      comments: rawDbData.comments || {},
      activeState: rawDbData.active_state || null
    });
  } catch (err) {
    console.error("GET /api/get-data error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u1ECDc c\u01A1 s\u1EDF d\u1EEF li\u1EC7u: ${err.message}` });
  }
});
app.get("/api/get-users", requireAuth("Admin"), async (req, res) => {
  try {
    const store = await getDatabaseData();
    const users = Array.isArray(store.users) ? store.users : [];
    const publicUsers = users.map(({ username, name, role }) => ({ username, name, role }));
    return res.json({ success: true, users: publicUsers });
  } catch (err) {
    console.error("GET /api/get-users error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u1ECDc danh s\xE1ch ng\u01B0\u1EDDi d\xF9ng: ${err.message}` });
  }
});
app.post("/api/save-users", requireAuth("Admin"), async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "D\u1EEF li\u1EC7u ng\u01B0\u1EDDi d\xF9ng ph\u1EA3i l\xE0 m\u1ED9t m\u1EA3ng." });
    }
    const store = await getDatabaseData();
    const existingByUsername = new Map(
      (Array.isArray(store.users) ? store.users : []).map((u) => [u.username.toLowerCase(), u])
    );
    const merged = users.map((incoming) => {
      const { passwordHash: _ignoredClientHash, salt: _ignoredClientSalt, newPassword, ...rest } = incoming;
      const existing = existingByUsername.get((incoming.username || "").toLowerCase());
      if (newPassword) {
        const salt = generateServerSalt();
        return { ...rest, passwordHash: hashPasswordScrypt(newPassword, salt), salt };
      }
      return { ...rest, passwordHash: existing?.passwordHash, salt: existing?.salt };
    });
    store.users = merged;
    await saveDatabaseData(store);
    await logAction(
      req.session,
      req,
      "save-users",
      `C\u1EADp nh\u1EADt danh s\xE1ch t\xE0i kho\u1EA3n (${merged.length} t\xE0i kho\u1EA3n: ${merged.map((u) => u.username).join(", ")})`
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/save-users error:", err);
    return res.status(500).json({ error: `L\u1ED7i l\u01B0u danh s\xE1ch ng\u01B0\u1EDDi d\xF9ng: ${err.message}` });
  }
});
app.post("/api/save-active-state", requireAuth("Editor"), async (req, res) => {
  try {
    const { selectedBrand, selectedTimelineId, activeCategoryTab } = req.body;
    const rawDbData = await getDatabaseData();
    rawDbData.active_state = {
      selectedBrand,
      selectedTimelineId,
      activeCategoryTab,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await saveDatabaseData(rawDbData);
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/save-active-state error:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/save-comments", requireAuth("Editor"), async (req, res) => {
  try {
    const { week, comments } = req.body;
    if (!week || !comments) {
      return res.status(400).json({ error: "Thi\u1EBFu th\xF4ng tin tu\u1EA7n b\xE1o c\xE1o ho\u1EB7c n\u1ED9i dung nh\u1EADn \u0111\u1ECBnh." });
    }
    const rawDbData = await getDatabaseData();
    if (!rawDbData.comments) {
      rawDbData.comments = {};
    }
    rawDbData.comments[week] = comments;
    await saveDatabaseData(rawDbData);
    await logAction(req.session, req, "save-comments", `C\u1EADp nh\u1EADt nh\u1EADn \u0111\u1ECBnh tu\u1EA7n ${week}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/save-comments error:", err);
    return res.status(500).json({ error: `L\u1ED7i l\u01B0u nh\u1EADn \u0111\u1ECBnh v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u: ${err.message}` });
  }
});
app.post("/api/save-raw-data", requireAuth("Editor"), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Thi\u1EBFu d\u1EEF li\u1EC7u \u0111\u1EC3 l\u01B0u." });
    }
    const rawDbData = await getDatabaseData();
    rawDbData.digital_marketing = data.digital_marketing || [];
    rawDbData.kol_koc = data.kol_koc || [];
    rawDbData.btl_trade = data.btl_trade || [];
    rawDbData.monthly_ooh_pr = data.monthly_ooh_pr || [];
    if (!rawDbData.btl_trade_monthly) {
      rawDbData.btl_trade_monthly = [];
    }
    rawDbData.btl_trade.forEach((row) => {
      const weekStr = row.week || "";
      const info = getBtlReportMonth(weekStr);
      const lastMonth = info.month === 1 ? 12 : info.month - 1;
      const lastYear = info.month === 1 ? info.year - 1 : info.year;
      const val = row.th\u1EF1c_hi\u1EC7n_th\u00E1ng;
      if (val !== void 0 && val !== null) {
        const match = rawDbData.btl_trade_monthly.find((m) => {
          return m.month === lastMonth && m.year === lastYear && (m.brand || "").toLowerCase() === (row.brand || "").toLowerCase() && (m.h\u1EA1ng_m\u1EE5c_l\u1EDBn || "").toLowerCase() === (row.h\u1EA1ng_m\u1EE5c_l\u1EDBn || "").toLowerCase() && (m.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c || "").toLowerCase() === (row.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c || "").toLowerCase() && (m.ph\u00E2n_lo\u1EA1i || "").toString().toLowerCase() === (row.ph\u00E2n_lo\u1EA1i || "").toString().toLowerCase() && (m.t\u1EA7n_su\u1EA5t || "").toLowerCase() === (row.t\u1EA7n_su\u1EA5t || "").toLowerCase() && (m.\u0111\u01A1n_v\u1ECB_t\u00EDnh || "").toLowerCase() === (row.\u0111\u01A1n_v\u1ECB_t\u00EDnh || "").toLowerCase();
        });
        if (match) {
          match.th\u1EF1c_hi\u1EC7n_th\u00E1ng = Number(val);
        } else {
          rawDbData.btl_trade_monthly.push({
            month: lastMonth,
            year: lastYear,
            brand: row.brand,
            h\u1EA1ng_m\u1EE5c_l\u1EDBn: row.h\u1EA1ng_m\u1EE5c_l\u1EDBn,
            chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c: row.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c,
            ph\u00E2n_lo\u1EA1i: row.ph\u00E2n_lo\u1EA1i,
            t\u1EA7n_su\u1EA5t: row.t\u1EA7n_su\u1EA5t,
            \u0111\u01A1n_v\u1ECB_t\u00EDnh: row.\u0111\u01A1n_v\u1ECB_t\u00EDnh,
            th\u1EF1c_hi\u1EC7n_th\u00E1ng: Number(val)
          });
        }
      }
    });
    if (data.btl_trade_monthly) {
      rawDbData.btl_trade_monthly = data.btl_trade_monthly;
    }
    await saveDatabaseData(rawDbData);
    const normalized = normalizeMarketingData(rawDbData);
    await logAction(
      req.session,
      req,
      "save-raw-data",
      `Ch\u1EC9nh s\u1EEDa tr\u1EF1c ti\u1EBFp d\u1EEF li\u1EC7u (${normalized.digital_marketing.length + normalized.kol_koc.length + normalized.btl_trade.length + normalized.monthly_ooh_pr.length} d\xF2ng)`
    );
    return res.json({ success: true, data: normalized });
  } catch (err) {
    console.error("POST /api/save-raw-data error:", err);
    return res.status(500).json({ error: `L\u1ED7i c\u1EADp nh\u1EADt c\u01A1 s\u1EDF d\u1EEF li\u1EC7u: ${err.message}` });
  }
});
app.post("/api/sync-data", requireAuth("Editor"), async (req, res) => {
  try {
    let mergeRowsByKey = function(currentList, newList, keyFn) {
      if (!newList || newList.length === 0) return currentList;
      const map = /* @__PURE__ */ new Map();
      currentList.forEach((row) => {
        map.set(keyFn(row), row);
      });
      newList.forEach((row) => {
        map.set(keyFn(row), row);
      });
      return Array.from(map.values());
    };
    const { newData } = req.body;
    if (!newData) {
      return res.status(400).json({ error: "Kh\xF4ng t\xECm th\u1EA5y d\u1EEF li\u1EC7u \u0111\u1ED3ng b\u1ED9 m\u1EDBi." });
    }
    const normalizedNew = normalizeMarketingData(newData);
    const currentFullDb = await getDatabaseData();
    const currentDb = normalizeMarketingData(currentFullDb);
    const getDigitalKey = (row) => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const nhom = (row.nh\u00F3m_b\u00E1o_c\u00E1o || "").toString().trim().toLowerCase();
      const hm = (row.h\u1EA1ng_m\u1EE5c || "").toString().trim().toLowerCase();
      const nganh = (row.ng\u00E0nh_h\u00E0ng || "").toString().trim().toLowerCase();
      const channel = (row.k\u00EAnh_channel || "").toString().trim().toLowerCase();
      const metric = (row.ch\u1EC9_s\u1ED1_metric || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${nhom}|${hm}|${nganh}|${channel}|${metric}`;
    };
    const getKolKey = (row) => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hm = (row.h\u1EA1ng_m\u1EE5c || "").toString().trim().toLowerCase();
      const nganh = (row.ng\u00E0nh_h\u00E0ng || "").toString().trim().toLowerCase();
      const channel = (row.k\u00EAnh_channel || "").toString().trim().toLowerCase();
      const metric = (row.ch\u1EC9_s\u1ED1_metric || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${hm}|${nganh}|${channel}|${metric}`;
    };
    const getBtlKey = (row) => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hml = (row.h\u1EA1ng_m\u1EE5c_l\u1EDBn || "").toString().trim().toLowerCase();
      const cthm = (row.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c || "").toString().trim().toLowerCase();
      const pl = (row.ph\u00E2n_lo\u1EA1i || "").toString().trim().toLowerCase();
      const ts = (row.t\u1EA7n_su\u1EA5t || "").toString().trim().toLowerCase();
      const dvt = (row.\u0111\u01A1n_v\u1ECB_t\u00EDnh || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
    };
    const getOohPrKey = (row) => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const tbc = (row.th\u00E1ng_b\u00E1o_c\u00E1o || "").toString().trim().toLowerCase();
      const hm = (row.h\u1EA1ng_m\u1EE5c || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const nganh = (row.ng\u00E0nh_h\u00E0ng || "").toString().trim().toLowerCase();
      const channel = (row.k\u00EAnh_channel || "").toString().trim().toLowerCase();
      const metric = (row.ch\u1EC9_s\u1ED1_metric || "").toString().trim().toLowerCase();
      return `${week}|${tbc}|${hm}|${brand}|${nganh}|${channel}|${metric}`;
    };
    const getBtlMonthlyKey = (row) => {
      const month = (row.month || 5).toString();
      const year = (row.year || 2026).toString();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hml = (row.h\u1EA1ng_m\u1EE5c_l\u1EDBn || "").toString().trim().toLowerCase();
      const cthm = (row.chi_ti\u1EBFt_h\u1EA1ng_m\u1EE5c || "").toString().trim().toLowerCase();
      const pl = (row.ph\u00E2n_lo\u1EA1i || "").toString().trim().toLowerCase();
      const ts = (row.t\u1EA7n_su\u1EA5t || "").toString().trim().toLowerCase();
      const dvt = (row.\u0111\u01A1n_v\u1ECB_t\u00EDnh || "").toString().trim().toLowerCase();
      return `${month}|${year}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
    };
    const mergedComments = { ...currentFullDb.comments || {} };
    if (newData && newData.comments) {
      Object.keys(newData.comments).forEach((weekKey) => {
        if (!mergedComments[weekKey]) {
          mergedComments[weekKey] = newData.comments[weekKey];
        } else {
          mergedComments[weekKey] = {
            ...mergedComments[weekKey],
            ...newData.comments[weekKey]
          };
        }
      });
    }
    const mergedData = {
      ...currentFullDb,
      digital_marketing: mergeRowsByKey(currentDb.digital_marketing, normalizedNew.digital_marketing, getDigitalKey),
      kol_koc: mergeRowsByKey(currentDb.kol_koc, normalizedNew.kol_koc, getKolKey),
      btl_trade: mergeRowsByKey(currentDb.btl_trade, normalizedNew.btl_trade, getBtlKey),
      monthly_ooh_pr: mergeRowsByKey(currentDb.monthly_ooh_pr, normalizedNew.monthly_ooh_pr, getOohPrKey),
      btl_trade_monthly: mergeRowsByKey(currentFullDb.btl_trade_monthly || [], normalizedNew.btl_trade_monthly || [], getBtlMonthlyKey),
      comments: mergedComments
    };
    await saveDatabaseData(mergedData);
    await logAction(req.session, req, "sync-data", "\u0110\u1ED3ng b\u1ED9 d\u1EEF li\u1EC7u ngo\u1EA1i tuy\u1EBFn (JSON/Excel)");
    const { users: _omitUsers, mail_config: _omitMailConfig, ...responseData } = mergedData;
    return res.json({ success: true, data: responseData });
  } catch (err) {
    console.error("POST /api/sync-data error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u1ED3ng b\u1ED9 h\xF3a d\u1EEF li\u1EC7u v\xE0o DB: ${err.message}` });
  }
});
app.get("/api/login-logs", requireAuth("Admin"), async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1e3);
    if (!isSupabaseConfigured) {
      return res.json({ success: true, logs: localLoginLogs.slice(0, limit) });
    }
    const { data, error } = await supabase.from("login_logs").select("id, username, status, ip, user_agent, session_id, created_at").order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(error.message);
    return res.json({ success: true, logs: data || [] });
  } catch (err) {
    console.error("GET /api/login-logs error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u1ECDc nh\u1EADt k\xFD \u0111\u0103ng nh\u1EADp: ${err.message}` });
  }
});
app.get("/api/action-logs", requireAuth(), async (req, res) => {
  try {
    const session = req.session;
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1e3);
    if (!isSupabaseConfigured) {
      const scoped = session.role === "Admin" ? localActionLogs : localActionLogs.filter((l) => l.username === session.username);
      return res.json({ success: true, logs: scoped.slice(0, limit) });
    }
    let query = supabase.from("action_logs").select("id, username, role, action, details, ip, created_at").order("created_at", { ascending: false }).limit(limit);
    if (session.role !== "Admin") {
      query = query.eq("username", session.username);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return res.json({ success: true, logs: data || [] });
  } catch (err) {
    console.error("GET /api/action-logs error:", err);
    return res.status(500).json({ error: `L\u1ED7i \u0111\u1ECDc nh\u1EADt k\xFD thao t\xE1c: ${err.message}` });
  }
});
registerSocialReportRoutes(app, { getDatabaseData, saveDatabaseData });
var app_default = app;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
