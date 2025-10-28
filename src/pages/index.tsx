// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/matrix"); // ✅ /matrix로 즉시 이동
  }, [router]);

  return null;
}