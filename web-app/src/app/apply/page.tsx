import { redirect } from "next/navigation";

export default function ApplyPage() {
  // Redirect to worker application by default
  redirect("/apply/worker");
}
