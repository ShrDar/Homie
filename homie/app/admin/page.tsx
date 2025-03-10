import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminVerifiedUI from "@/components/AdminPage/AdminVerifiedUI";

export default async function AdminLoginPage() {
  const session = await auth(); // Fetch session on the server

  if (!session?.user?.id) {
    redirect("/"); // Redirect if not logged in
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session.user.id}`,
    { cache: "no-store" } // Ensure fresh data
  );

  if (!response.ok) {
    redirect("/"); // Redirect on error
  }

  const user = await response.json();

  if (user.role !== "ADMIN") {
    redirect("/"); // Redirect if not an admin
  }

  return <AdminVerifiedUI />;
}
