interface Artist {
  name: string;
  role: string;
  image: string;
  alt: string;
  /** Headline act gets the full-width treatment. */
  headline?: boolean;
}

const ARTISTS: Artist[] = [
  {
    name: "ZAVY",
    role: "Headline Set",
    image: "/assets/generated/artist-zavy.dim_900x1200.jpg",
    alt: "ZAVY silhouetted on stage under electric blue rim lighting",
    headline: true,
  },
  {
    name: "Special Guest",
    role: "Live Vocals",
    image: "/assets/generated/artist-guest.dim_900x1200.jpg",
    alt: "Guest vocalist lit by a single cyan spotlight on a dark stage",
  },
  {
    name: "DJ Support",
    role: "Warm Up",
    image: "/assets/generated/artist-dj.dim_900x1200.jpg",
    alt: "DJ performing behind turntables against blue and cyan LED panels",
  },
];

/**
 * Lineup — oversized artist names over cinematic stage imagery.
 * The headline act spans the full grid; support acts sit beneath it.
 */
export function LineupSection() {
  const [headline, ...support] = ARTISTS;

  return (
    <section
      data-ocid="lineup.section"
      className="border-t border-white/5 bg-surface-1"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="label-eyebrow">The Lineup</p>
        <h2 className="font-display-xl mt-4 text-foreground">
          Three acts. One stage.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article
            data-ocid="lineup.item.1"
            className="group relative isolate overflow-hidden rounded-sm border border-white/10 md:col-span-2"
          >
            <img
              src={headline.image}
              alt={headline.alt}
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              className="h-[26rem] w-full object-cover object-center transition-smooth group-hover:scale-[1.03] md:h-[32rem]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="label-eyebrow text-accent">{headline.role}</p>
              <h3 className="font-hero mt-3 text-foreground">
                {headline.name}
              </h3>
            </div>
          </article>

          {support.map((artist, index) => (
            <article
              key={artist.name}
              data-ocid={`lineup.item.${index + 2}`}
              className="group relative isolate overflow-hidden rounded-sm border border-white/10"
            >
              <img
                src={artist.image}
                alt={artist.alt}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="h-[22rem] w-full object-cover object-center transition-smooth group-hover:scale-[1.03] md:h-[26rem]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="label-eyebrow text-accent">{artist.role}</p>
                <h3 className="font-display-xl mt-2 text-foreground">
                  {artist.name}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
