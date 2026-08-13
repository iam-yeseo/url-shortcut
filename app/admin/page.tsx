import type { Metadata } from "next";
import { AdminPanel } from "./admin-panel";

export const metadata: Metadata = {
  title: "플레이그라운드 관리",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
