export default function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="container-x pb-16 pt-36 md:pb-24 md:pt-48">
      <p className="eyebrow text-bronze">{eyebrow}</p>
      <h1 className="mt-5 max-w-5xl font-serif text-[clamp(2.8rem,7vw,6.5rem)] font-light leading-[0.95] text-ink">{title}</h1>
      {intro && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-graphite">{intro}</p>}
    </section>
  );
}
