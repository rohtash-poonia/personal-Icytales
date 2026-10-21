import CommonHero from "@/components/common/CommonHero";
import Link from "next/link";
import React from "react";

const Hero = () => {
  return (
    <div>
      <CommonHero
        title="Terms & Conditions"
        breadcrumb={
          <>
            <Link href="/">
              <span>Home</span>
            </Link>

            <span>/</span>

            <Link href="termsAndConditions ">
              <span>Terms & Conditions</span>
            </Link>
          </>
        }
      />
    </div>
  );
};

export default Hero;
