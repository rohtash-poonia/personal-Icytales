import { PolicyData, termsData } from '@/components/common/Helper'
import React from 'react'

const PrivacyPolicy = () => {
  return (
    <section className="container py-25 max-lg:py-18 max-md:py-12 max-sm:py-8">
      {/* Heading */}
      <h2 className="text-3xl max-lg:text-2xl max-md:text-xl max-sm:textlg max-md:leading-6 max-sm:leading-4 font-semibold text-darkbrown leading-7.5 ">
        Privacy Policy:
      </h2>

      {/* Intro Text */}
      <p className="text-lightbrown  pt-2.75 leading-6 max-md:text-sm max-md:leading-5">
        Protecting your privacy is important to us. This Privacy Policy outlines
        how we collect, use, and disclose personal information when you use our
        website.
      </p>

      {/* Mapping Terms */}
      <div className="pt-5 max-md:pt-3 max-md:leading-5 max-md:space-y-2 space-y-4">
        {PolicyData.map((item) => (
          <div key={item.id}>
            <h3 className="font-bold text-darkbrown leading-5.5 text-[22px] max-lg:text-lg max-md:text-base max-md:leading-4">
              {item.id}. {item.title}
            </h3>

            <p className="text-lightbrown max-md:text-sm max-md:leading-4 max-sm:text-xs max-md:pt-1  pt-2 leading-6 max-w-276.25 w-full">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <p className="text-lightbrown pt-5 max-md:pt-3 max-md:leading-4 max-md:text-sm max-sm:text-xs leading-6">
        By using our website, you consent to the terms of this Privacy Policy.
        If you have any questions or concerns, please contact us.
      </p>
    </section>
  );
}

export default PrivacyPolicy