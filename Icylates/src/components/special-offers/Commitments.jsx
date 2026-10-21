import { CommitmentCards } from '@/components/common/Helper';
import Image from 'next/image';
import React from 'react'

const Commitments = () => {
  return (
    <>
      <section className=" bg-[linear-gradient(301.26deg,#EFD7EF_8%,#F5F9FC_43%,#F8EAE1_64%,#EAF8F9_87%)] ">
        <div className="container pt-35.5 pb-37 max-lg:py-26 max-md:py-16 max-sm:py-8">
          {/* Heading */}
          <div className="text-center">
            <h2 className="heading text-darkbrown">
              Our <span className="text-pink">Commitments</span> to You
            </h2>
            <p className="text-lightbrown text-xl leading-6.5 pt-4.5 text-center  max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3 ">
              Exceeding expectations with every promise we make.
            </p>
          </div>

          {/* Main Layout */}
          <div className=" grid grid-cols-3 pt-27.5 max-lg:pt-20 max-md:pt-12 max-sm:pt-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:mx-auto justify-between gap-7 max-lg:gap-5  items-center">
            {/* Left Cards */}
            <div className="flex flex-col gap-7 max-lg:gap-5 max-md:gap-3 max-sm:mx-auto ">
              {CommitmentCards.slice(0, 2).map((card) => {
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-[20px] p-[31px_27px_35px_27px] max-lg:p-[26px_22px_28px_22px] max-sm:p-[22px_16px_23px_16px] max-sm:min-w-75  max-w-63.75 w-full text-center hover:shadow-lg transition"
                  >
                    <div className="w-18.75  h-18.75  relative mx-auto flex items-center justify-center rounded-full text-white ">
                      <Image src={card.icon} fill alt={card.title} />
                    </div>

                    <h3 className="font-bold leading-6 max-md:text-lg max-md:leading-4 max-md:pt-3 text-darkbrown text-xl pt-5">
                      {card.title}
                    </h3>
                    <p className="text-lightbrown max-md:leading-4 max-md:text-sm max-md:pt-1 leading-6 pt-2.75">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Center Image */}
            <div className=" pt-14.5 max-lg:pt-10 max-md:pt-6 max-sm:pt-4 max-sm:mx-auto ">
              <Image
                src="/images/commitmentMainIceCream.png"
                alt="icecream"
                width={389}
                height={644}
                className="object-contain"
              />
            </div>

            {/* Right Cards */}
            <div className="flex flex-col gap-8 max-lg:gap-5 max-md:gap-3 max-sm:mx-auto ">
              {CommitmentCards.slice(2, 4).map((card) => {
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-[20px] p-[31px_37px_35px_37px]  max-lg:p-[26px_22px_28px_22px] max-sm:p-[22px_16px_23px_16px] max-sm:min-w-75  max-w-63.75 w-full text-center hover:shadow-lg transition"
                  >
                    <div className="w-18.75  h-18.75  relative mx-auto flex items-center justify-center rounded-full text-white ">
                      <Image src={card.icon} fill alt={card.title} />
                    </div>

                    <h3 className="font-bold leading-6 max-w-45 mx-auto max-md:text-lg max-md:leading-4 max-md:pt-3 w-full flex justify-center items-center text-darkbrown text-xl pt-5">
                      {card.title}
                    </h3>
                    <p className="text-lightbrown max-md:leading-4 max-md:text-sm max-md:pt-1 leading-6 pt-2.75">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Commitments