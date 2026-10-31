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
            className="h-10 w-10 shrink-0 rounded-full lg:hidden"
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
                {user ? "Admin dashboard" : "Admin login"}
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
        <section className="relative isolate min-h-[590px] overflow-hidden bg-neutral-950 sm:min-h-[660px] lg:min-h-[700px]">
          <img
            src={workspace}
            alt="A shared workspace designed for focused work and collaboration"
            width={1600}
            height={1008}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

          <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-5 py-20 sm:min-h-[660px] sm:px-8 lg:min-h-[700px]">
            <div className="max-w-3xl text-white">
              <div className="mb-7 inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                Work. Connect. Grow.
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-6xl xl:text-[72px]">
                Make space for
                <span className="mt-2 block text-orange-400">
                  your next big thing.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                Welcome to Kazini Shared coworking — a place for independent
                minds, growing businesses, and meaningful connections.
              </p>

              <div className="mt-9 grid grid-cols-2 gap-3 sm:flex sm:items-center">
                <Button
                  size="lg"
                  onClick={openRegistration}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/35 px-2 text-xs font-medium text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto sm:px-5 sm:text-sm"
                >
                  Join Kazini
                  <ArrowUpRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                </Button>

                <a
                  href="#spaces"
                  className="hidden sm:inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/20 px-2 text-xs font-medium text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto sm:px-5 sm:text-sm"
                >
                  Find your workspace
                  <ArrowUpRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>

          <a
            href="#spaces"
            aria-label="Scroll to workspace options"
            className="absolute bottom-7 right-6 hidden h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all hover:bg-white/10 sm:flex lg:right-12"
          >
            <ArrowRight className="h-5 w-5 rotate-90" />
          </a>
        </section>

        {/* Workspace cards */}
        <section
          id="spaces"
          className="scroll-mt-24 bg-background px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-ink">
                  Find your fit
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Space to do your
                  <span className="block text-foreground">best work.</span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Different people work differently. Explore our workspace
                  options and tell us what would make your workday better.
                </p>
              </div>

              <a
                href="#contact"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-ink transition-colors hover:text-primary-ink/75"
              >
                Have a question?
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {workspaceOptions.map((item) => (
                <article
                  key={item.number}
                  className="group overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-ink/30 hover:shadow-xl hover:shadow-black/[0.04]"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={1000}
                      height={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-ink">
                        <item.icon className="h-5 w-5" />
                      </div>

                      <span className="text-xs font-medium tracking-wider text-muted-foreground">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={openRegistration}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-ink transition-all hover:gap-3"
                    >
                      Enquire now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-muted/60 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary-ink shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Not sure which option suits you?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Tell us what you have in mind, and let’s start a
                    conversation.
                  </p>
                </div>
              </div>

              <Button
                onClick={openRegistration}
                variant="outline"
                className="shrink-0 rounded-xl"
              >
                Talk to our team
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="scroll-mt-24 overflow-hidden border-y border-border bg-card"
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
        {/* Conversion banner */}
        <section className="relative isolate overflow-hidden bg-black">
          <div className="absolute -right-20 -top-36 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center md:justify-between lg:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-300">
                Your space. Your community.
              </div>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Make room for
                <span className="block text-orange-400">
                  what comes next.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Tell us what your ideal workspace looks like and take the first
                step towards finding your fit at Kazini Shared.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:shrink-0 sm:flex-row md:flex-col lg:flex-row">
              <Button
                size="lg"
                onClick={openRegistration}
                className="min-h-12 h-13 w-full rounded-xl bg-primary px-3 font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7"
              >
                Join Kazini
                <ArrowUpRight className="ml-2 h-5 w-5 shrink-0" />
              </Button>

              <a
                href="#contact"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-3 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-6"
              >
                Contact us
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-24 border-b border-border bg-card px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-ink">
                Good to know
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked questions.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                Have something else in mind? Our team is available through the
                contact details below.
              </p>

              <a
                href="mailto:info@kazini.co.ke"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-ink hover:underline"
              >
                Ask us a question
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq, index) => {
                const isActive = activeFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      aria-expanded={isActive}
                      onClick={() => setActiveFaq(isActive ? null : index)}
                      className="flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                    >
                      <span className="text-sm font-semibold leading-6 sm:text-base">
                        {faq.question}
                      </span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isActive ? "rotate-180 text-primary-ink" : ""
                          }`}
                        />
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={`max-w-2xl text-sm leading-7 text-muted-foreground ${
                            isActive ? "pb-6" : "pb-0"
                          }`}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="scroll-mt-24 bg-background">
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