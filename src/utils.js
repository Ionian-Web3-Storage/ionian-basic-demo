export function shortenAddr(str) {
  if (typeof str !== "string" || !str.startsWith("0x")) return str;
  return `0x${str.substring(2, 8)}...${str.substring(36, 42)}`;
}
