"use client";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { useWishlist } from "@/components/context/WishlistContext";
import ProductDetailsCard from "@/components/common/ProductDetailsCard";
import Button from "@/components/common/Button";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, loading, error, retry } = useWishlist();
  return <section className="container py-12 md:py-20"><h1 className="heading mb-8 text-center">Your <span className="text-pink">Wishlist</span></h1>
    {loading ? <p role="status">Loading wishlist…</p> : !user ? <div className="text-center"><p>Sign in to view your saved products.</p><Button as={Link} href="/login?returnTo=/wishlist" theme="primary" className="mx-auto mt-6 w-fit px-8 py-3">Sign in</Button></div> : error ? <div role="alert"><p>{error}</p><Button onClick={retry} theme="primary" className="mt-4 px-6 py-3">Try again</Button></div> : wishlist.length ? <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{wishlist.map(product=><ProductDetailsCard key={product.id} {...product}/>)}</div> : <div className="text-center"><p>Your wishlist is empty. Save a favorite flavor to find it here.</p><Button as={Link} href="/shop" theme="primary" className="mx-auto mt-6 w-fit px-8 py-3">Browse flavors</Button></div>}
  </section>;
}
