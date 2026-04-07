import { redirect } from "next/navigation";

// /admin → redirect to /admin/reports
export default function AdminPage() {
  redirect("/admin/reports");
}
