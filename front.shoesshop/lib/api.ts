export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5049/api";
const res = await fetch(`${API_BASE_URL}/Shoes`);