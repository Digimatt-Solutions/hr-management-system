import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  Laptop,
  CalendarDays,
  Users,
  Armchair,
  CheckCircle2,
  ChevronDown,
  Building2,
  Clock3,
  MoveRight,
  MessageCircle,
  ShieldCheck,
  Printer,
  Lightbulb,
  Handshake,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ClientForm from "@/components/ClientForm";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/kazini-logo.png";
import workspace from "@/assets/Kazini/kazini23.jpeg";
import work from "@/assets/Kazini/kazini23.jpeg";
import space from "@/assets/Kazini/kazini28.jpeg";
import share from "@/assets/Kazini/kazini12.jpeg";
import thrive from "@/assets/Kazini/kazini6.jpeg";
import peace from "@/assets/Kazini/kazini21.jpeg";

const workspaceOptions = [
  {
    number: "01",
    title: "Flexible Coworking",
    description:
      "Cowork in a shared space with like-minded people & an environment that supports your work.",
    image:
      work,
    icon: Laptop,
  },
  {
    number: "02",
    title: "Dedicated Desks",
    description:
      "Create a consistent working routine with a space to concentrate on what matters.",
    image:
      space,
    icon: Armchair,
  },
  {
    number: "03",
    title: "Meeting Rooms",
    description:
      "Bring people together for conversations, collaboration, and productive meetings.",
    image:
      share,
    icon: Users,
  },
  {
    number: "04",
    title: "Cyber Services",
    description:
      "Access a range of cyber services to support your business and working needs.",
    image:
      thrive,
    icon: CalendarDays,
  },
];

const journeySteps = [
  {
    number: "01",
    title: "Explore your options",
    description:
      "Discover the workspace options and identify what suits your working style.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Tell us what you need",
    description:
      "Share your details, business needs, and workspace preferences through our form.",
    icon: MessageCircle,
  },
  {
    number: "03",
    title: "Connect with Kazini",
    description:
      "Submit your enquiry so the Kazini team can follow up about your requirements.",
    icon: CheckCircle2,
  },
];

const faqs = [
  {
    question: "What workspace options does Kazini offer?",
    answer:
      "Kazini Shared showcases flexible coworking, dedicated desks, meeting rooms, and options for different working routines. Contact our team to discuss your specific needs.",
  },
  {
    question: "How do I get started?",
    answer:
      "Click any Join Kazini or Find Your Workspace button and complete the registration form. Share your workspace preferences and contact details so your enquiry can be followed up.",
  },
  {
    question: "Can I enquire about meeting rooms?",
    answer:
      "Yes. Use the Join Kazini form to describe your meeting requirements. Include your preferred arrangements so the team can advise you on the available options.",
  },
  {
    question: "Where is Kazini Shared located?",
    answer:
      "We are located at Shompole Business Park, Kiserian-Isinya-Magadi Junction, near Galana Station.",
  },
  {
    question: "How can I contact the team?",
    answer:
      "Email info@kazini.co.ke or call +254 700 113 300 or +254 705 414 414 for enquiries.",
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const { user } = useAuth();

  const closeMenu = () => setMenu(false);

  const openRegistration = () => {
    setMenu(false);
    setOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-homeSans text-foreground [&_h1]:font-homeHeading [&_h2]:font-homeHeading [&_h3]:font-homeHeading">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:h-[84px]">
          <Link
            to="/"
            aria-label="Kazini Shared home"
            onClick={closeMenu}
            className="shrink-0"
          >
            <img
              src={logo}
              alt="Kazini Shared"
              width={160}
              height={64}
              className="h-12 w-32 object-contain sm:h-14 sm:w-36"
            />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 text-sm font-medium lg:flex xl:gap-9"
          >
            <a href="#about" className="transition-colors hover:text-primary-ink">
              About Kazini
            </a>
            <a href="#spaces" className="transition-colors hover:text-primary-ink">
              Our spaces
            </a>
            <a href="#contact" className="transition-colors hover:text-primary-ink">
              Contact
            </a>
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="transition-colors hover:text-primary-ink"
            >
              {user ? "Admin dashboard" : "Admin login"}
            </Link>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <Button
              onClick={openRegistration}
              className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Join Kazini
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            className="h-10 w-10 shrink-0 rounded-xl lg:hidden"
            onClick={() => setMenu((value) => !value)}
          >
            {menu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile navigation */}
        {menu && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-border bg-background px-5 pb-6 pt-4 shadow-lg lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ["About Kazini", "#about"],
                ["Our spaces", "#spaces"],
                ["Frequently asked questions", "#faq"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-primary-ink"
                >
                  {label}
                </a>
              ))}

              <Link
                to={user ? "/dashboard" : "/auth"}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-primary-ink"
              >
                {user ? "Admin dashboard" : "User login"}
              </Link>

              <Button
                onClick={openRegistration}
                className="mt-3 h-12 rounded-xl"
              >
                Join Kazini
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        
<section className="relative isolate overflow-hidden bg-foreground">
  <img
    src={workspace}
    alt="A shared workspace designed for focused work and collaboration"
    width={1600}
    height={1008}
    fetchPriority="high"
    className="absolute inset-0 h-full w-full object-cover animate-[heroZoom_18s_ease-out_forwards]"
  />

  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/15" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

  <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-5 pb-24 pt-28 sm:min-h-[640px] sm:px-8 sm:pb-36 sm:pt-16 lg:min-h-[700px]">
    <div className="w-full max-w-3xl animate-enter text-background">
      <p className="mb-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary sm:mb-6 sm:text-sm sm:tracking-[0.22em]">
        Work. Connect. Grow.
      </p>

      <h1 className="max-w-2xl text-[2.60rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl xl:text-[76px]">
        Make space for
        <span className="mt-1 block text-primary">
          your next big thing.
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-7 text-background/75 sm:mt-6 sm:text-lg sm:leading-8">
        Welcome to Kazini Shared coworking space, a place for independent
        minds, growing businesses, and meaningful connections.
      </p>

      <div className="mt-7 flex flex-row flex-wrap items-center justify-start gap-2.5 sm:mt-9 sm:gap-3">
  <Button
    size="lg"
    onClick={openRegistration}
    className="h-10 rounded-lg px-4 text-xs font-semibold text-black/80 shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5 sm:h-12 sm:rounded-xl sm:px-7 sm:text-sm"
  >
    <span className="sm:hidden">Become part of Kazini</span>
    <span className="hidden sm:inline">Join Kazini</span>
    <ArrowUpRight className="h-4 w-4 sm:ml-1 sm:h-5 sm:w-5" />
  </Button>

  <a
    href="#spaces"
    className="hidden h-12 items-center justify-center gap-2 rounded-xl border border-background/30 px-6 text-sm font-semibold text-background transition-colors hover:bg-background/10 sm:inline-flex"
  >
    Find your workspace
    <ArrowRight className="h-4 w-4" />
  </a>
</div>
    </div>
  </div>

  {/* Feature strip - hidden on mobile */}
  <div className="absolute inset-x-0 bottom-0 hidden border-t border-background/15 bg-black/45 backdrop-blur-md sm:block">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-5 py-5 sm:px-8 md:grid-cols-5 md:divide-x md:divide-background/15">
      {[
        [Laptop, "Flexible", "coworking"],
        [Armchair, "Dedicated", "desks"],
        [Users, "Meeting", "rooms"],
        [Printer, "Cyber", "services"],
        [MapPin, "Kiserian,", "Shompole Business Park"],
      ].map(([Icon, a, b], i) => {
        const I = Icon as typeof Laptop;
        return (
          <div
            key={i}
            className="flex items-center gap-3 md:justify-center md:px-4"
          >
            <I className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-xs font-medium leading-tight text-background sm:text-sm">
              {a as string}<br />{b as string}
            </span>
          </div>
        );
      })}
    </div>
  </div>
</section>

        {/* Workspace cards */}
        <section id="spaces" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-ink">
                   Our co-working spaces
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Space to do your best work.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  Different people work differently. Explore our workspace options
                  and tell us what would make your workday better.
                </p>
              </div>
              <a href="#join" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-ink hover:gap-3 transition-all">
                Enquire about a space <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workspaceOptions.map((item) => (
                <button
                  type="button"
                  key={item.number}
                  onClick={openRegistration}
                  aria-label={`Enquire about ${item.title}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                      {item.number}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-3 p-5">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <item.icon className="h-5 w-5 text-primary-ink" />
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="scroll-mt-24 overflow-hidden  border-border bg-card"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 md:grid-cols-2 md:items-center lg:gap-20 lg:py-28">
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-28 w-28 rounded-tl-[2rem] border-l-2 border-t-2 border-primary-ink/50 sm:-left-6 sm:-top-6" />

              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={peace}
                  alt="An inviting shared workspace with room to focus and collaborate"
                  width={1600}
                  height={1008}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>

              <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 rounded-br-[2rem] border-b-2 border-r-2 border-primary-ink/50 sm:block" />
            </div>

            <div className="py-2">
              <div className="inline-flex items-center gap-2 px-1 py-1 text-sm font-semibold uppercase tracking-[0.15em] text-primary-ink">
                Welcome to Kazini
              </div>

              <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                More than a desk.
                <span className="block text-foreground">
                  A place to belong.
                </span>
              </h2>

              <p className="mt-6 text-base leading-7 text-muted-foreground">
                Kazini Shared brings people and businesses into a shared
                working community. Whether you are looking for a flexible
                workday, a dedicated desk, or a place to meet, we want to
                understand what works for you.
              </p>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Tell us about your work, your business, and the environment you
                need. We will use your enquiry to better understand your
                requirements.
              </p>

              <Button
                onClick={openRegistration}
                className="mt-8 h-12 rounded-xl px-6"
              >
                Become part of Kazini
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Join / enquiry */}
        <section id="join" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-ink">How to join</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find your fit in three steps.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {journeySteps.map((s) => (
                <div key={s.number} className="surface-gloss rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary-ink">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="text-3xl font-semibold text-muted-foreground/40">{s.number}</span>
                  </div>
                  <h3 className="mt-5 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-10 overflow-hidden rounded-3xl bg-foreground">
              <img src={thrive} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="relative flex flex-col gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ready when you are</p>
                  <h3 className="mt-3 text-2xl font-semibold text-background sm:text-3xl">
                    Make room for what comes next.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-background/70">
                    Tell us what your ideal workspace looks like and 
                    we will follow up with the options that suit your needs.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={openRegistration} className="h-12 rounded-full px-7">
                    Open enquiry form <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                  <a href="#contact" className="inline-flex h-12 items-center gap-2 rounded-full border border-background/40 px-6 text-sm font-semibold text-background hover:bg-background/10">
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-y border-border bg-card px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-ink">Good to know</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked questions.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                Have something else in mind? Our team is available through the
                contact details below.
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isActive = activeFaq === index;
                return (
                  <div key={faq.question} className={`rounded-2xl border px-5 transition-colors ${isActive ? "border-primary-ink/40 bg-background" : "border-border"}`}>
                    <button
                      type="button"
                      aria-expanded={isActive}
                      onClick={() => setActiveFaq(isActive ? null : index)}
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className="text-sm font-semibold sm:text-base">{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isActive ? "rotate-180 text-primary-ink" : ""}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <p className="pb-5 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-14 px-5 py-14 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[work, space, share, thrive, peace, workspace].map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl">
                  <img src={src} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <Link to="/" aria-label="Kazini Shared home">
              <img
                src={logo}
                alt="Kazini Shared"
                width={192}
                height={80}
                loading="lazy"
                className="h-16 w-44 object-contain object-left"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              A shared workspace for people, ideas, and new possibilities. Find
              your working rhythm and make room for your next chapter.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                <ShieldCheck className="h-4 w-4" />
              </span>
              A community built around work and connection.
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em]">
              Let’s connect
            </h3>

            <div className="space-y-4">
              <a
                className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary-ink"
                href="mailto:info@kazini.co.ke"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary-ink transition-colors group-hover:bg-primary/10">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="pt-2">info@kazini.co.ke</span>
              </a>

              <a
                className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary-ink"
                href="tel:+254700113300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary-ink transition-colors group-hover:bg-primary/10">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="pt-2">+254 700 113 300</span>
              </a>

              <a
                className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary-ink"
                href="tel:+254705414414"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary-ink transition-colors group-hover:bg-primary/10">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="pt-2">+254 705 414 414</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em]">
              Find Kazini
            </h3>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-ink">
                <MapPin className="h-5 w-5" />
              </span>

              <address className="pt-1 text-sm not-italic leading-7 text-muted-foreground">
                <span className="font-medium text-foreground">
                  Shompole Business Park
                </span>
                <br />
                Kiserian-Isinya-Magadi Junction
                <br />
                Near Galana Station
              </address>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Shompole+Business+Park+Kiserian"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-ink hover:underline"
            >
              Get directions
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <Clock3 className="h-4 w-4 shrink-0" />
              Contact us to discuss your workspace requirements.
            </p>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} Kazini Shared. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-3">
              <Link
                to="/privacy"
                className="transition-colors hover:text-primary-ink"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="transition-colors hover:text-primary-ink"
              >
                Terms &amp; Conditions
              </Link>

              <Link
                to="/auth"
                className="transition-colors hover:text-primary-ink"
              >
                Access
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Existing registration form */}
      <ClientForm open={open} onOpenChange={setOpen} />
    </div>
  );
}