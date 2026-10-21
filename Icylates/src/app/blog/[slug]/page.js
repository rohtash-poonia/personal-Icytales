import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCards } from "@/components/common/Helper";

const entries = BlogCards.map((card, index) => ({
  ...card,
  slug: `${card.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
}));

export function generateStaticParams() {
  return entries.map((entry) => ({ slug: entry.slug }));
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) notFound();
  return (
    <article className="container max-w-4xl py-16">
      <Link href="/blog" className="text-pink underline">
        Back to blog
      </Link>
      <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-pink">
        {entry.category}
      </p>
      <h1 className="mt-3 text-4xl font-bold text-darkbrown">
        {entry.blogcardtitle}
      </h1>
      <Image
        src={entry.blogcardimage}
        alt={entry.blogcardtitle}
        width={900}
        height={500}
        className="mt-8 h-auto w-full rounded-3xl object-cover"
        priority
      />
      <p className="mt-8 text-lg leading-8 text-lightbrown">
        {entry.blogcardtext}
      </p>
    </article>
  );
}
