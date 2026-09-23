import { achievements, education, leadership } from "@/content/site";

/**
 * The about section. Deliberately not a résumé: one paragraph in his own voice,
 * one result that actually matters, and two supporting lines. Anything that
 * only existed to fill a CV column was cut rather than restyled.
 */
export function Credentials() {
  const major = achievements.find((entry) => entry.weight === "major");
  const school = education[0];

  return (
    <section id="about" className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <p data-reveal className="label">
        About
      </p>

      <div data-reveal className="mt-8 max-w-[36rem]">
        <p className="text-pretty font-serif text-[27px] leading-[1.32] text-bone sm:text-[32px]">
          I&apos;m in my final year of B.E. Information Technology at PICT, Pune. I build AI systems
          end to end — architecture, data modelling, deployment — and then keep working on them once
          real people are using them.
        </p>
        <p className="mt-6 max-w-md text-pretty text-[15px] leading-relaxed text-muted">
          A car dealership in Pune runs one of them every day. Most of what I know came from putting
          something in front of users like that and watching where it broke.
        </p>
      </div>

      {/* The one result worth setting in type. */}
      {major ? (
        <div data-reveal data-reveal-delay="120" className="mt-16 sm:mt-20">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" />
            <p className="label">Recognition</p>
          </div>
          <div className="rule mt-3" />

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-baseline sm:gap-10">
            {major.figure ? (
              <p className="font-mono text-[46px] leading-none tracking-tight text-signal sm:shrink-0 sm:text-[68px]">
                {major.figure}
              </p>
            ) : null}
            <div className="max-w-md">
              <h3 className="font-sans text-[21px] font-medium leading-snug tracking-tight text-bone sm:text-[24px]">
                {major.title}
              </h3>
              <p className="mt-2.5 text-pretty text-[15px] leading-relaxed text-muted">
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
          className="mt-16 border-t border-line pt-6 sm:mt-20"
        >
          <div className="flex flex-col gap-x-8 gap-y-2 sm:flex-row sm:items-baseline">
            <p className="label sm:w-28 sm:shrink-0">Education</p>
            <p className="flex-1 font-sans text-[15px] text-bone">
              {school.credential}
              <span className="text-muted"> · {school.institution}</span>
            </p>
            <p className="font-mono text-[12px] text-faint sm:shrink-0">
              {school.detail} · {school.period}
            </p>
          </div>
        </div>
      ) : null}

      <div data-reveal data-reveal-delay="240" className="mt-10 border-t border-line pt-6">
        <div className="flex flex-col gap-x-8 gap-y-4 sm:flex-row">
          <p className="label sm:w-28 sm:shrink-0 sm:pt-0.5">Leadership</p>
          <ul className="flex-1 space-y-5">
            {leadership.map((entry) => (
              <li key={entry.role}>
                <div className="flex flex-col gap-x-6 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="font-sans text-[15px] text-bone">
                    {entry.role}
                    <span className="text-faint"> · {entry.org}</span>
                  </p>
                  <p className="label shrink-0">{entry.period}</p>
                </div>
                <p className="mt-1.5 max-w-lg text-pretty text-[13px] leading-relaxed text-faint">
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
