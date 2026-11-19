import { redirect } from "next/navigation";
import { getSessionUserId } from "~/lib/session";
import Link from "next/link";
import { StudioHeader } from "~/components/StudioHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSessionUserId())) redirect("/login");
  return (
    <>
      <StudioHeader section="workspace">
        <Link href="/live">Live forms</Link>
      </StudioHeader>
      {children}
    </>
  );
}
