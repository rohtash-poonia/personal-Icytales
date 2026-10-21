/** @format */

import Image from "next/image";
import Link from "next/link";
import { AdminIcon, CalenderIcon } from "../common/Icons";
import { BlogCards } from "../common/Helper";

export const blogEntries = BlogCards.map((card, index) => ({
  ...card,
  slug: `${card.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
}));

export default function BlogData({ cards = blogEntries, columns = 2 }) {
  const grid = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2';
  return (
    <div className={`container grid gap-8 py-10 ${grid}`}>
      {cards.map((card) => (
        <article key={card.slug} className="w-full overflow-hidden rounded-xl shadow-[0_6px_41px_6px_#0000000D]">
          <Image className={columns === 1 ? "h-auto max-h-[560px] w-full object-cover" : "h-64 w-full object-cover"} src={card.blogcardimage} width={540} height={285} alt={card.blogcardtitle} />
          <div className="p-6">
            <div className="flex flex-wrap gap-5">
              <span className="flex items-center gap-2 text-xs text-lightbrown"><AdminIcon />Posted by Admin</span>
              <span className="flex items-center gap-2 text-xs text-lightbrown"><CalenderIcon />October 30, 2022</span>
            </div>
            <h2 className="mt-5 text-xl font-bold leading-6.5"><Link href={`/blog/${card.slug}`} className="hover:text-pink">{card.blogcardtitle}</Link></h2>
            <p className="mt-3 leading-6.5 text-lightbrown">{card.blogcardtext}</p>
            <Link href={`/blog/${card.slug}`} className="mt-6 inline-block text-sm font-bold underline decoration-pink decoration-2 underline-offset-4">Read More</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
