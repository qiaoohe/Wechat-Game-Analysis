/** 站点 favicon / apple-touch-icon 共用视觉（品牌红 + M） */
export function BrandIconMark({
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
        letterSpacing: "-0.04em",
      }}
    >
      M
    </div>
  );
}
