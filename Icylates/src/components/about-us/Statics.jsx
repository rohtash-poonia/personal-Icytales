import { statisticsData } from "@/components/common/Helper";
import React from "react";

const Statics = () => {
  return (
    <section className="py-36.25 max-lg:py-26 max-md:py-18  max-sm:py-10">
      <div className="container flex flex-col justify-center items-center">
        {/* Heading */}
        <h2 className="heading text-center text-darkbrown">
          Our <span className="text-pink">Statistics</span>
        </h2>

        {/* Subtitle */}
        <p className="pt-4.5 text-lightbrown leading-6.5 text-xl text-center  max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3">
          What makes us special through our impressive statistics.
        </p>

        {/* Cards */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-12.5 max-lg:pt-9 max-md:pt-7 max-sm:pt-5 gap-7.5">
          {statisticsData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-[15px] px-6 py-12.5 max-lg:py-11 max-md:py-9 max-sm:py-6.5 border-b-2 flex justify-center items-center border-pink shadow-[0px_12px_105px_12px_#00000008] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0px_15px_40px_rgba(236,72,153,0.35)]"
            >
              <div className="flex flex-col gap-7 max-lg:gap-6 max-md:gap-5 max-sm:gap-4">
                <h3 className="text-[44px] max-md:text-4xl max-sm:text-3xl berkshire text-center leading-11 text-darkbrown">
                  {item.value}
                  <sup className="text-pink-500 text-lg ml-1">
                    {item.symbol}
                  </sup>
                </h3>

                <p className="mt-2 max-md:text-sm text-lightbrown w-full min-w-35.5 flex justify-center items-center ">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statics;
