/** 顶栏 Logo：SVG 文字锚定，保证 M 视觉居中 */
export function BrandIconMark({
  size,
  radius,
  fontSize,
}: {
  size: number;
  radius: number;
  fontSize: number;
}) {
  const vb = 48;
  const scale = vb / size;
  const rx = Math.max(1, radius * scale);
  const fs = fontSize * scale;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width={vb} height={vb} rx={rx} ry={rx} fill="#e04d4e" />
      <text
        x={vb / 2}
        y={vb / 2 + vb * 0.02}
        fill="#ffffff"
        fontSize={fs}
        fontWeight={700}
        fontFamily='system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        textAnchor="middle"
        dominantBaseline="middle"
      >
        M
      </text>
    </svg>
  );
}

/**
 * favicon / apple-icon（next/og ImageResponse）专用。
 * Satori 不支持 SVG <text>，需用 flex + 光学微调。
 */
export function BrandIconMarkOg({
  size,
  radius,
  fontSize,
}: {
  size: number;
  radius: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e04d4e",
        borderRadius: radius,
        color: "#ffffff",
        fontSize,
        fontWeight: 700,
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: 1,
        letterSpacing: 0,
        // 光学居中：M 字框通常偏右上
        paddingRight: Math.round(size * 0.04),
        paddingBottom: Math.round(size * 0.04),
      }}
    >
      M
    </div>
  );
}
