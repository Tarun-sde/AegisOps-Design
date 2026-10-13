import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard-page";
export const metadata: Metadata = { title: "Heron Dashboard" };
export default function Page() {
  return <DashboardPage />;
}
