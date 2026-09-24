import { achievements, education, leadership } from "@/content/site";

/**
 * The about section. Deliberately not a résumé: one paragraph in his own voice,
 * one result that actually matters, and two supporting lines. Anything that
 * only existed to fill a CV column was cut rather than restyled.
 *
 * Glass rule (stated in full in `work.tsx`): the opening paragraph is running
 * prose and sits straight on the page; the award, the degree and the leadership
 * record are each a discrete object, so each gets glass — the same glass, not
 * three different approximations of it.
 *
 * Rhythm: close tier — py-20 md:py-28, content mt-12. The close runs at a
 * quieter volume than Work by design.
 */
export function Credentials() {
  const major = achievements.find((entry) => entry.weight === "major");
  const school = education[0];

  return (
    <section
      id="about"
      className="ambient relative mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-28"
    >
      <p data-reveal className="label">
        About
      </p>

      <div data-reveal className="mt-5 max-w-[36rem]">
        <p className="text-pretty font-serif text-[25px] leading-[1.34] text-bone sm:text-[30px]">
          I&apos;m in my final year of B.E. Information Technology at PICT, Pune. I build AI systems
          end to end — architecture, data modelling, deployment — and then keep working on them once
          real people are using them.
        </p>
        <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-muted">
          A car dealership in Pune runs one of them every day. Most of what I know came from putting
          something in front of users like that and watching where it broke.
        </p>
      </div>

      {/* The one result worth setting in type. */}
      {major ? (
        <div
          data-reveal
          data-reveal-delay="120"
          className="glass-panel mt-12 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12"
        >
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[1px] bg-signal" />
            <p className="label">Recognition</p>
          </div>
          <div className="rule mt-4" />

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-baseline sm:gap-12">
            {major.figure ? (
              <p className="font-mono text-[48px] leading-none tracking-tight text-signal sm:shrink-0 sm:text-[76px]">
                {major.figure}
              </p>
            ) : null}
            <div className="max-w-md">
              <h3 className="font-sans text-[21px] font-medium leading-snug tracking-tight text-bone sm:text-[24px]">
                {major.title}
              </h3>
              <p className="mt-3.5 text-pretty text-[15px] leading-relaxed text-muted">
                {major.detail}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* One degree, one line. */}
      {school ? (
        <div
          data-reveal
          data-reveal-delay="180"
          className="glass-panel mt-5 px-6 py-6 sm:px-8"
        >
          <div className="flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-baseline">
            <p className="label sm:w-28 sm:shrink-0">Education</p>
            <p className="flex-1 font-sans text-[15px] text-bone">
              {school.credential}
              <span className="text-muted"> · {school.institution}</span>
            </p>
            <p className="font-mono text-[12px] text-muted sm:shrink-0">
              {school.detail} · {school.period}
            </p>
          </div>
        </div>
      ) : null}

      <div
        data-reveal
        data-reveal-delay="240"
        className="glass-panel mt-5 px-6 py-7 sm:px-8"
      >
        <div className="flex flex-col gap-x-8 gap-y-5 sm:flex-row">
          <p className="label sm:w-28 sm:shrink-0 sm:pt-0.5">Leadership</p>
          <ul className="flex-1 divide-y divide-line">
            {leadership.map((entry) => (
              <li key={entry.role} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-x-6 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="font-sans text-[15px] text-bone">
                    {entry.role}
                    <span className="text-muted"> · {entry.org}</span>
                  </p>
                  <p className="label shrink-0">{entry.period}</p>
                </div>
                <p className="mt-2 max-w-lg text-pretty text-[13px] leading-relaxed text-muted">
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
