import { achievements, education, leadership } from "@/content/site";

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="label">{children}</p>
      <div className="rule mt-2" />
    </div>
  );
}

export function Credentials() {
  const major = achievements.find((entry) => entry.weight === "major");
  const minor = achievements.filter((entry) => entry.weight !== "major");

  return (
    <section id="about" className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <p data-reveal className="label">
        About
      </p>

      <div className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-12">
        <div data-reveal className="md:col-span-7">
          <p className="max-w-xl text-pretty font-serif text-2xl leading-[1.35] text-bone sm:text-3xl">
            I&apos;m in my final year of B.E. Information Technology at PICT, Pune. I build AI
            systems end to end — architecture, data modelling, deployment, and the iteration after
            launch.
          </p>
          <p className="mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-muted">
            Most of what I know came from putting something in front of real users and watching
            where it broke.
          </p>
        </div>

        {/* The one result worth elevating above everything else here. */}
        {major ? (
          <div
            data-reveal
            data-reveal-delay="100"
            className="border border-line-bright bg-surface p-6 md:col-span-5"
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" />
              <p className="label">Recognition</p>
            </div>
            <h3 className="mt-4 font-sans text-xl font-medium tracking-tight text-bone">
              {major.title}
            </h3>
            <p className="mt-2.5 text-pretty text-[14.5px] leading-relaxed text-muted">
              {major.detail}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-12">
        <div data-reveal className="md:col-span-5">
          <ColumnHeading>Education</ColumnHeading>
          <ol className="border-l border-line">
            {education.map((entry) => (
              <li key={entry.institution} className="relative pb-6 pl-5 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute left-[-3px] top-[7px] h-[5px] w-[5px] rotate-45 border border-line-bright bg-void"
                />
                <p className="label">{entry.period}</p>
                <p className="mt-1.5 font-sans text-[15px] text-bone">{entry.credential}</p>
                <p className="mt-0.5 text-[14px] text-muted">{entry.institution}</p>
                <p className="mt-1 font-mono text-[12px] text-faint">{entry.detail}</p>
                {entry.coursework ? (
                  <p className="mt-2 max-w-sm text-pretty text-[12.5px] leading-relaxed text-faint">
                    {entry.coursework}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal data-reveal-delay="80" className="md:col-span-3">
          <ColumnHeading>Also</ColumnHeading>
          <ul>
            {minor.map((entry) => (
              <li key={entry.title} className="border-b border-line py-3 first:pt-0 last:border-b-0">
                <p className="font-sans text-[14.5px] text-bone">{entry.title}</p>
                <p className="mt-1 text-pretty text-[13px] leading-relaxed text-muted">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal data-reveal-delay="160" className="md:col-span-4">
          <ColumnHeading>Leadership</ColumnHeading>
          <ul>
            {leadership.map((entry) => (
              <li key={entry.role} className="border-b border-line py-3 first:pt-0 last:border-b-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-sans text-[14.5px] text-bone">{entry.role}</p>
                  <p className="label shrink-0">{entry.period}</p>
                </div>
                <p className="mt-0.5 font-mono text-[12px] text-faint">{entry.org}</p>
                <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-muted">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
