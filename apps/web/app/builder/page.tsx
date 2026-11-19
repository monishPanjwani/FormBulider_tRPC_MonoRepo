import { getSessionUserId } from "~/lib/session";
import { redirect } from "next/navigation";
import { FormBuilderApp } from "./FormBuilderApp";

export default async function BuilderPage(props: { searchParams: Promise<{ id?: string }> }) {
    const userId = await getSessionUserId();
    const searchParams = await props.searchParams;

    if (!userId) {
        redirect("/login");
    }

    return <FormBuilderApp key={searchParams.id} formId={searchParams.id} />;
}
