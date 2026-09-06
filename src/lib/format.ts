export function formatPrice(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

export const RICH_TEXT_CLASS =
  "text-sm text-gray-700 leading-relaxed space-y-3 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-gray-900 [&_h2]:mt-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-700 [&_a]:underline";
