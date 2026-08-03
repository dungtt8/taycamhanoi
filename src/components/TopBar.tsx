export default function TopBar({ showHotline = true }: { showHotline?: boolean }) {
  return (
    <div className="bg-blue-900 text-white text-xs py-2 text-center tracking-wide">
      🎮 FREESHIP TOÀN QUỐC | BẢO HÀNH CHÍNH HÃNG 12 THÁNG
      {showHotline ? " | HOTLINE: 090.xxx.xxxx" : ""}
    </div>
  );
}
