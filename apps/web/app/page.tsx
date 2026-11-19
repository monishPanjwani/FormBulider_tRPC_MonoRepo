import { ArrowRight, ArrowUpRight, Braces, ClipboardList, Layers3, Terminal } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { StudioHeader } from "~/components/StudioHeader";

export default async function Home() {
  const signedIn = (await cookies()).has("authToken");
  const workspace = signedIn ? "/dashboard" : "/signup";
  return (
    <div className="landing">
      <StudioHeader>
        <Link href="/live">Live forms</Link>
        <Link href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Dashboard" : "Log in"}</Link>
      </StudioHeader>
      <main className="studio-container">
        <section className="hero">
          <div>
            <h1>
              Forms with
              <br />
              <em>purpose.</em>
              <span className="cursor-block" aria-hidden="true" />
            </h1>
            <p>
              Build a form, publish its link, and read the responses in one workspace. Start with a
              template or make it your own.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={workspace} className="action">
                {signedIn ? "Open dashboard" : "Start building"} <ArrowRight size={18} />
              </Link>
              <Link href="/live" className="secondary-action">
                Browse live forms <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <figure className="specimen" aria-label="Example event registration form">
            <div className="specimen-bar">
              <span>
                <Terminal size={16} /> formcraft / preview
              </span>
              <span aria-hidden="true">── □</span>
            </div>
            <div className="specimen-content">
              <span className="meta">Event registration</span>
              <h2>
                Studio open house<span>.</span>
              </h2>
              <p>Reserve a place at our next studio session.</p>
              <div className="sample-label">Attendee name</div>
              <div className="sample-input">Alex Rivera</div>
              <div className="sample-label">How will you attend?</div>
              <div className="sample-options">
                <span>◉ &nbsp; In person</span>
                <span>○ &nbsp; Online</span>
              </div>
            </div>
            <figcaption>
              <span className="status-dot" /> Template preview
            </figcaption>
          </figure>
        </section>
        <section className="workflow" aria-label="Form workspace features">
          <article>
            <Layers3 />
            <h2>Choose a template</h2>
            <p>
              Start with a demo request, event registration, or one of six other purpose-built
              forms.
            </p>
          </article>
          <article>
            <Braces />
            <h2>Shape the questions</h2>
            <p>
              Drag fields into place, edit the options, and preview exactly what people will see.
            </p>
          </article>
          <article>
            <ClipboardList />
            <h2>Read the responses</h2>
            <p>Share your published link and review submissions together in your dashboard.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
