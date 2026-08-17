/**
 * /pro 商务合作联系方式。
 * 优先读环境变量；默认个人微信 momorank01。
 */
const DEFAULT_WECHAT = "momorank01";
const DEFAULT_NOTE = "添加请备注：情报助理";
/** 微信二维码（放在 public/pro/wechat-qr.png） */
export const BUSINESS_WECHAT_QR_SRC = "/pro/wechat-qr.png";

export function getBusinessContact() {
  const wechat =
    process.env.NEXT_PUBLIC_BUSINESS_WECHAT?.trim() || DEFAULT_WECHAT;
  const note =
    process.env.NEXT_PUBLIC_BUSINESS_NOTE?.trim() || DEFAULT_NOTE;

  return { wechat, note };
}
