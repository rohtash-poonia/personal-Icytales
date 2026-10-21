import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "../common/Button";
import { ButtonLeftArrow } from "../common/Icons";

const Thanks = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(120deg,#EFD7EF,#F5F9FC,#F8EAE1,#EAF8F9)] px-4">
      <div className="text-center">
        <div className="flex justify-center">
          <Image
            src="/images/figma/recovered/thankyou-image.png"
            alt="thank-you"
            width={166}
            height={165}
          />
        </div>
        <h2 className="text-[90px] sm:text-[112px] text-[#212529] berkshire pt-10.5 ">
          Thank You!
        </h2>
        <p className="text-[22px] text-lightbrown max-w-185 w-full text-center pt-7">
          We&apos;re delighted you&apos;ve decided to treat yourself to our delectable ice
          creams. Your order has been received and is now being prepared with
          care.
        </p>
        <Link href="/">
          <div className="flex items-center justify-center">
            <Button
              theme="primary"
              height="h-[58px]"
              width="w-[200.2px]"
              iconposition="flex-row-reverse gap-[23.68px]"
              icons={<ButtonLeftArrow />}
              className="mt-12.75"
            >
              Back to Home
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Thanks;
