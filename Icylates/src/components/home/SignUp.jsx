"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../common/Button";
import { RightArrow } from "../common/Icons";
import { subscribeNewsletter } from "@/lib/api";

const SignUp = ({compact = false}) => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!consent) {
      setStatus({ type: "error", message: "Please agree to the privacy policy before subscribing." });
      return;
    }
    setSubmitting(true);
    try {
      const result = await subscribeNewsletter({ email, consent: true });
      setEmail("");
      setConsent(false);
      setStatus({ type: "success", message: result.message || "Your subscription has been saved." });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "Subscription could not be saved. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={compact ? "w-full py-6" : "pb-38 pt-35.5 max-lg:py-28 max-md:py-20 max-sm:py-8"}>
      <div className="container relative">
        {!compact && <Image src="/images/figma/original/d3c96.png" width={64} height={62} alt="" className="pointer-events-none absolute bottom-12 left-0 hidden lg:block" />}
        {!compact && <Image src="/images/figma/original/e97c0.png" width={52} height={55} alt="" className="pointer-events-none absolute top-12 right-0 hidden lg:block" />}
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center">
          {!compact && <h2 className="heading w-full max-w-177.75 text-center">Sign up For <span className="text-pink">Exclusive Deals</span> and Updates</h2>}
          <p className="pt-7 text-center text-xl leading-6.5 text-lightbrown max-lg:pt-5 max-lg:text-lg max-md:text-base max-md:leading-4 max-sm:pt-3 max-sm:text-sm">{compact ? 'Be the first to know about our latest updates.' : 'Stay updated with new products and available offers.'}</p>
          <div className="flex w-full max-w-182.5 items-center justify-center gap-2.5 pt-13.75 max-lg:pt-12 max-md:pt-9 max-sm:flex-col max-sm:pt-7">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="h-15.5 w-full max-w-130 rounded-[30px] px-7 shadow-[0px_2px_73px_2px_#0000000D] outline-none max-lg:h-12.5 max-md:placeholder:text-xs max-sm:max-w-150 max-sm:border max-sm:border-pink" placeholder="Enter Your Email Address" />
            <Button theme="primary" height="h-[62px] max-lg:h-[50px]" width="w-[200px] max-lg:min-w-[160px] max-md:min-w-[140px] max-sm:w-full" icons={<RightArrow />} className="uppercase tracking-wide" type="submit" loading={submitting}>Subscribe</Button>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-3 pt-9.25 max-lg:pt-8 max-md:pt-7">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="accent-pink" />
            <span>I agree to the <Link href="/privacy-policy" className="text-pink-500 underline">privacy policy</Link></span>
          </label>
          {status.message && <p role={status.type === "error" ? "alert" : "status"} className={`mt-4 text-center text-sm ${status.type === "error" ? "text-red-700" : "text-green-700"}`}>{status.message}</p>}
        </form>
      </div>
    </section>
  );
};

export default SignUp;
