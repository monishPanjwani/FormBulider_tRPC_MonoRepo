import Link from "next/link";
import { StudioHeader } from "~/components/StudioHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StudioHeader section="workspace">
        <Link href="/live">Live forms</Link>
      </StudioHeader>
      {children}
    </>
  );
}
