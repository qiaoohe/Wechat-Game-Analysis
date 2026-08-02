import { ImageResponse } from "next/og";

import { BrandIconMarkOg } from "@/lib/brand-icon";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/** Google 搜索 favicon 建议 ≥48×48 PNG；Next 会注入 link rel=icon */
export default function Icon() {
  return new ImageResponse(
    <BrandIconMarkOg size={48} radius={10} fontSize={28} />,
    size,
  );
}
