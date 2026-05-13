import Link from "next/link";
import { AppointaLogo } from "@/components/appointa-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimateIn } from "@/components/animate-in";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute left-1/2 top-[-20%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] h-[40vh] w-[50vw] max-w-xl rounded-full bg-info/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-border-subtle/80 bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Link href="/" className="rounded-xl outline-offset-4" aria-label="Appointa home">
            <AppointaLogo priority />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main">
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline"
            >
              Features
            </a>
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary min-h-11 min-w-11 inline-flex items-center justify-center sm:min-w-0"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0B0F13] shadow-sm shadow-accent/20 transition-colors duration-200 hover:bg-accent-hover"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_min(42%,480px)] lg:items-center lg:gap-16">
            <div className="max-w-xl lg:max-w-none">
              <p className="animate-fade-up font-mono text-xs font-medium uppercase tracking-widest text-accent sm:text-sm">
                AI-assisted scheduling
              </p>
              <h1 className="animate-fade-up animation-delay-1 mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
                Book appointments in a conversation.
              </h1>
              <p className="animate-fade-up animation-delay-2 mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                Describe what you need in plain language. Appointa understands intent, extracts times and
                details, and keeps everything in one calm workspace—form fallback when something is still
                ambiguous.
              </p>
              <div className="animate-fade-up animation-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-8 text-base font-semibold text-[#0B0F13] shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30"
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-bg-surface px-8 text-base font-semibold text-text-primary transition-colors duration-200 hover:border-accent/40 hover:bg-bg-elevated"
                >
                  Sign in
                </Link>
              </div>
              <ul className="animate-fade-up animation-delay-4 mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                  Multi-turn memory
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                  Structured fallback
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                  Your data, your account
                </li>
              </ul>
            </div>

            <div className="animate-fade-up animation-delay-2 lg:justify-self-end w-full">
              <ChatPreviewCard />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-t border-border-subtle bg-bg-surface/50 py-20 sm:py-24"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <AnimateIn>
              <div className="max-w-2xl">
                <h2 id="features-heading" className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                  Built for clarity, not complexity.
                </h2>
                <p className="mt-3 text-text-secondary sm:text-lg">
                  Three pillars that match how real teams schedule with an assistant.
                </p>
              </div>
            </AnimateIn>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <AnimateIn delay={0}>
                <FeatureCard
                  title="AI understands your request"
                  description="Natural language first. The model interprets intent and surfaces structured fields—dates, duration, notes—without rigid forms up front."
                  icon={<IconSpark />}
                />
              </AnimateIn>
              <AnimateIn delay={100}>
                <FeatureCard
                  title="Books in seconds"
                  description="Once details are clear, confirmations land in your appointment list instantly. No tab-hopping, no double entry."
                  icon={<IconBolt />}
                />
              </AnimateIn>
              <AnimateIn delay={200}>
                <FeatureCard
                  title="Manage in one place"
                  description="Chat and calendar-style list live side by side. Filter upcoming and past visits, and reopen any thread to adjust."
                  icon={<IconLayers />}
                />
              </AnimateIn>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-accent/10 blur-2xl" aria-hidden />
              <div className="relative max-w-xl">
                <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                  Ready when you are.
                </h2>
                <p className="mt-3 text-text-secondary sm:text-lg">
                  Create an account and open your workspace. The assessment prototype keeps the stack honest:
                  Next.js, Express, PostgreSQL, and Mistral—wired end to end.
                </p>
              </div>
              <div className="relative mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 min-w-[11rem] items-center justify-center rounded-xl bg-accent px-6 text-center text-sm font-semibold text-[#0B0F13] transition-colors hover:bg-accent-hover"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 min-w-[11rem] items-center justify-center rounded-xl border border-border-strong px-6 text-center text-sm font-semibold text-text-primary transition-colors hover:bg-bg-surface"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </AnimateIn>
        </section>
      </main>

      <footer className="mt-auto border-t border-border-subtle py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <AppointaLogo compact className="sm:hidden" />
          <AppointaLogo className="hidden sm:inline-flex" />
          <p className="text-center text-sm text-text-muted sm:text-right">
            © {new Date().getFullYear()} Appointa. Assessment prototype.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ChatPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/20 via-transparent to-transparent opacity-60 blur-sm" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            <span className="text-xs font-medium text-text-secondary">Active session</span>
          </div>
          <span className="rounded-lg bg-accent-soft px-2 py-1 font-mono text-[11px] font-medium text-accent">
            Demo preview
          </span>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm leading-relaxed text-[#0B0F13]">
              I need a 30-minute intro call next Tuesday morning, ideally before 11.
            </div>
          </div>
          <div className="flex justify-start gap-2">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft ring-1 ring-accent/20">
              <span className="text-xs font-bold text-accent">A</span>
            </div>
            <div className="max-w-[90%] space-y-3">
              <div className="rounded-2xl rounded-bl-md border border-border-subtle bg-bg-surface px-4 py-3 text-sm leading-relaxed text-text-primary">
                I can book a 30-minute slot on Tuesday. I have{" "}
                <span className="font-medium text-accent">9:00 AM</span> or{" "}
                <span className="font-medium text-accent">10:30 AM</span> open. Which works better?
              </div>
              <div className="rounded-xl border border-border-subtle bg-bg-base/80 px-3 py-2.5">
                <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  Extracted
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-text-muted">Date</dt>
                    <dd className="font-medium text-text-primary">Tue (next)</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Duration</dt>
                    <dd className="font-medium text-text-primary">30 min</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-muted">Window</dt>
                    <dd className="font-medium text-text-primary">Before 11:00 AM</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-10 pt-1">
            <span className="size-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
            <span className="ml-2 text-xs text-text-muted">Appointa is typing</span>
          </div>
        </div>
        <div className="border-t border-border-subtle bg-bg-surface/50 p-3">
          <div className="flex items-end gap-2 rounded-xl border border-border-subtle bg-bg-base px-3 py-2">
            <div className="min-h-10 flex-1 rounded-lg bg-transparent py-2 text-sm text-text-muted">
              Message your concierge…
            </div>
            <span className="mb-2 size-2 shrink-0 rounded-full bg-success" title="Connected" aria-label="Connected" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="relative flex cursor-default flex-col rounded-2xl border border-border-subtle bg-bg-elevated p-6">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{description}</p>
    </article>
  );
}

function IconSpark() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75L2.25 12l4.179 2.25m8.182-7.5L21.75 12l-4.179 2.25M2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 12m8.182 7.5L15 16.5l5.571-3m-11.142 0L15 16.5m-6.429 3.75L21.75 12m-8.182-7.5L15 7.5m-6.429 3.75L15 7.5m0 0v9"
      />
    </svg>
  );
}
