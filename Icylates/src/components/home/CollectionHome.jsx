import Image from "next/image";
import Link from "next/link";
import CatalogSwiper from "../common/CatalogSwiper";
import HappyCustomer from "./HappyCustomer";
import SignUp from "./SignUp";
import FollowUs from "./FollowUs";
import Questions from "../faq's/Questions";
import LimitedOffer from "../faq's/LimitedOffer";
import Button from "../common/Button";

const asset = (name) => `/images/figma/original/${name}.png`;
const cta =
  "inline-flex rounded-full bg-pink px-8 py-5 font-semibold text-white mt-8";
export default function CollectionHome({ kind }) {
  const vegan = kind === "vegan";
  const category = vegan ? "Vegan" : "Gelato";
  const href = `/shop?category=${category}`;
  const options = vegan
    ? [
        ["4f5f9", "Vegan Sundaes"],
        ["e7404", "Plant-Based Scoops"],
        ["b66d0", "Dairy-Free Treats"],
      ]
    : [
        ["97a4a", "Classic Flavors"],
        ["dbd44", "Seasonal Specials"],
        ["df4f9", "Gelato Cakes"],
        ["566bc", "Gelato Pints"],
      ];
  return (
    <>
      <section
        className={
          vegan
            ? "relative overflow-hidden bg-darkpurple text-white"
            : "relative overflow-hidden bg-pink"
        }
        style={{
          backgroundImage: `url(${asset(vegan ? "57772" : "7d841")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex min-h-[700px] max-w-300 items-center gap-8 px-5 py-16 max-lg:flex-col lg:min-h-[860px]">
          <div
            className={
              vegan
                ? "w-full lg:w-1/2"
                : "flex min-h-[540px] w-full max-w-[690px] flex-col items-center justify-center rounded-full border-b-[20px] border-[#c23e82] bg-white px-8 py-16 text-center lg:min-h-[720px]"
            }
          >
            <h1 className="berkshire text-6xl leading-none sm:text-7xl lg:text-[100px]">
              {vegan ? (
                "Vegan Ice Cream Delights"
              ) : (
                <>
                  Artisan <span className="text-pink">Gelato</span> Shop
                </>
              )}
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-8">
              {vegan
                ? "Discover a world of tasty vegan ice cream flavors and desserts that everyone can enjoy."
                : "Experience the rich, creamy flavors of our artisan gelato creations."}
            </p>
            <Button as={Link} theme="primary" href={href} className={cta}>
              {vegan
                ? "Explore Our Vegan Flavors"
                : "Discover Our Gelato Flavors"}{" "}
              →
            </Button>
          </div>
          {vegan && (
            <Image
              src={asset("c8b68")}
              alt="Vegan ice cream assortment"
              width={700}
              height={700}
              priority
              className="h-auto w-full max-w-[700px] lg:w-1/2"
            />
          )}
        </div>
      </section>
      {vegan && (
        <section className="container py-20 lg:py-36">
          <h2 className="heading mb-12 text-center">
            Our Popular <span className="text-pink">Vegan</span> Treats
          </h2>
          <CatalogSwiper category={category} variant={kind} />
        </section>
      )}
      <section className="bg-[#fbf8fc] py-16 lg:py-36">
        <div className="container flex items-center gap-12 max-md:flex-col">
          <Image
            src={asset(vegan ? "07791" : "d6a74")}
            alt={vegan ? "Plant-based ice cream" : "Artisan gelato scoops"}
            width={570}
            height={581}
            className="h-auto w-full md:w-1/2"
          />
          <div>
            <h2 className="heading">
              {vegan ? (
                <>
                  Our Guilt-Free <span className="text-pink">Vegan</span> Ice
                  Cream
                </>
              ) : (
                <>
                  Experience the Art of{" "}
                  <span className="text-pink">Gelato</span>
                </>
              )}
            </h2>
            <p className="mt-8 text-xl leading-8 text-lightbrown">
              {vegan
                ? "Enjoy creamy, dairy-free ice cream that’s both tasty and kind to the planet."
                : "Handcrafted Flavors with Fresh, Local Ingredients."}
            </p>
            <p className="mt-6 text-xl leading-8 text-lightbrown">
              {vegan
                ? "Delicious Flavors Made With Only the Best Plant-Based Ingredients."
                : "Enjoy gelato made with the finest ingredients and traditional techniques."}
            </p>
            <Button as={Link} theme="primary" href={href} className={cta}>
              See Our {category} Menu →
            </Button>
          </div>
        </div>
      </section>
      {!vegan && (
        <section className="container py-20 lg:py-36">
          <h2 className="heading mb-12 text-center">
            Our <span className="text-pink">Artisan Gelato</span> Flavors
          </h2>
          <CatalogSwiper category={category} variant={kind} />
        </section>
      )}
      <section className="container py-20 lg:py-36">
        <h2 className="heading mb-12 text-center">
          {vegan ? "Browse Our Vegan Options" : "Find Your Perfect Gelato"}
        </h2>
        <div
          className={`grid gap-6 sm:grid-cols-2 ${vegan ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {options.map(([image, label]) => (
            <Link
              key={image}
              href={href}
              className="relative overflow-hidden rounded-2xl"
            >
              <Image
                src={asset(image)}
                alt={label}
                width={350}
                height={380}
                className="h-80 w-full object-cover"
              />
              <span className="absolute inset-x-3 bottom-3 rounded-xl bg-white px-5 py-4 font-semibold">
                {label} →
              </span>
            </Link>
          ))}
        </div>
      </section>
      {vegan ? (
        <LimitedOffer />
      ) : (
        <section className="bg-darkpurple text-white">
          <div className="container flex items-center gap-10 py-20 max-md:flex-col">
            <div className="md:w-1/2">
              <h2 className="heading">Gelato Lovers’ Special!</h2>
              <Button
                as={Link}
                theme="primary"
                href="/special-offers"
                className={cta}
              >
                Explore Offers →
              </Button>
            </div>
            <Image
              src={asset("73d5b")}
              alt="Gelato assortment with fresh fruit"
              width={760}
              height={600}
              className="h-auto w-full md:w-1/2"
            />
          </div>
        </section>
      )}
      <section className="container py-20 lg:py-36">
        <h2 className="heading mb-12 text-center">
          {vegan ? "Best Vegan Ice Creams" : "Most Popular Gelato Flavors"}
        </h2>
        <CatalogSwiper category={category} variant={kind} sort="rating" />
      </section>
      <HappyCustomer />
      {vegan ? (
        <>
          <SignUp />
          <FollowUs />
        </>
      ) : (
        <Questions />
      )}
    </>
  );
}
