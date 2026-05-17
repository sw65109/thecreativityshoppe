"use client";

import Image from "next/image";
import Link from "next/link";
import LandingProductCard from "./ui/LandingProductCard";
import type { Product } from "@/types/product";

type CraftShow = {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
};

function formatShowDateRange(start: string, end: string | null) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startDate = new Date(`${start}T00:00:00`);
  if (!end) return fmt.format(startDate);

  const endDate = new Date(`${end}T00:00:00`);
  if (start === end) return fmt.format(startDate);
  return `${fmt.format(startDate)} – ${fmt.format(endDate)}`;
}

export default function Landing({
  products,
  craftShows,
}: {
  products: Product[];
  craftShows: CraftShow[];
}) {
  return (
    <div className="bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-top bg-no-repeat">
      <section className="pt-12 text-sandstone">
        <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            Creating Functional Art
          </h1>

          <Link href="/shop">
            <button className="my-8 rounded-full bg-sandstone px-6 py-3 font-semibold text-background transition hover:opacity-90">
              Shop now
            </button>
          </Link>

          <div className="mt-16 w-full max-w-5xl">
            <div className=" my-10 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-center">
              <Image
                src="/the_creativity_shoppe1.png"
                alt="Tree Logo"
                width={440}
                height={440}
                loading="eager"
                className="rounded-full bg-sandstone object-contain"
              />

              <div className="flex justify-center">
                <LandingProductCard products={products} />
              </div>
            </div>

            <p className=" my-20 text-center text-3xl font-semibold md:text-4xl">
              We believe in Quality Craftsmanship
            </p>

            <div className="py-10 rounded-2xl border border-sandstone/30 bg-sandstone p-5 text-left">
              <h3 className=" pb-6 text-lg text-background font-semibold">Upcoming Craft Shows</h3>

              {craftShows.length ? (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {craftShows.map((show) => (
                    <li
                      key={show.id}
                      className="rounded-xl border border-sandstone/20 bg-[url('/textures/redwood_grain.jpg')] p-4"
                    >
                      <p className="font-semibold">{show.name}</p>
                      <p className="text-sm text-sandstone/80">
                        {formatShowDateRange(show.start_date, show.end_date)}
                      </p>
                      {show.location ? (
                        <p className="text-sm text-sandstone/80">
                          {show.location}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-sandstone/80">
                  No shows announced yet — check back soon.
                </p>
              )}
            </div>

          </div>

          <div className="mt-48 mb-48 w-full max-w-3xl">
            <Image
              src="/booth.jpg"
              alt="The Creativity Shoppe booth"
              width={1600}
              height={900}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 768px, 768px"
              priority
              className="h-auto w-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
