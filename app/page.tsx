import type { Metadata } from "next";
import { LinkHub } from "./link-hub";

export const metadata: Metadata = {
  title: { absolute: "Vibe Archive" },
  description: "그동안 만든 바이브코딩 프로젝트를 한곳에서 만나보세요.",
};

export default function Home() {
  return <LinkHub />;
}
