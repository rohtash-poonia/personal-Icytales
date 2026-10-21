import { termsData } from '@/components/common/Helper';
import React from 'react'

const TermsAndConditions = () => {
  return (
    <section className="container py-25 max-lg:py-18 max-md:py-12 max-sm:py-8">
      {/* Heading */}
      <h2 className="text-3xl max-lg:text-2xl max-md:text-xl max-sm:textlg max-md:leading-6 max-sm:leading-4 font-semibold text-darkbrown leading-7.5 ">
        Terms and Conditions:
      </h2>

      {/* Intro Text */}
      <p className="text-lightbrown  pt-2.75 leading-6 max-md:text-sm max-md:leading-5">
        Welcome to [Your Online Education Platform]! Before accessing or using
        our website, please read these Terms and Conditions carefully. By
        accessing or using any part of the site, you agree to be bound by these
        Terms and Conditions.
      </p>

      {/* Mapping Terms */}
      <div className="pt-5 space-y-4 max-md:pt-3 max-md:leading-5 max-md:space-y-2">
        {termsData.map((item) => (
          <div key={item.id}>
            <h3 className="font-bold text-darkbrown max-lg:text-lg max-md:text-base leading-5.5 text-[22px]">
              {item.id}. {item.title}
            </h3>

            <p className="text-lightbrown max-md:text-sm max-md:leading-4 max-sm:text-xs max-md:pt-1 pt-2 leading-6 max-w-276.5 w-full">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <p className="text-lightbrown pt-5 leading-6 max-md:pt-3 max-md:leading-4 max-md:text-sm max-sm:text-xs">
        Please review our full Terms and Conditions for more detailed
        information.
      </p>
    </section>
  );
}

export default TermsAndConditions