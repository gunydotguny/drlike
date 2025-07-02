import "dotenv/config";
import axios from "axios";

const CHROMA_HOST = process.env.CHROMA_HOST!;

async function test() {
  const res = await axios.get(`${CHROMA_HOST}/api/v1/collections`);
  console.log("📦 컬렉션 목록:", res.data);
}

test();