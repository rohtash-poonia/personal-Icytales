import { teamData } from "@/components/common/Helper";
import {
  Facebookicon,
  Instaicon,
  Youtubeicon,
} from "@/components/common/Icons";
import Image from "next/image";
import React from "react";

const OurTeam = () => {
  return (
    <section className="container  pt-35.5 pb-20 max-lg:py-18 max-md:py-13 max-sm:py-8">
      <div className="flex justify-center flex-col items-center">
        <h2 className="heading text-darkbrown">
          Our <span className="text-pink">Team</span> Members
        </h2>

        {/* Subtitle */}
        <p className="pt-4.5 leading-6.5 text-xl text-lightbrown text-center  max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3">
          Get to know the friendly faces behind your favorite flavors.
        </p>
      </div>
      <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-18.75 max-lg:gap-12 max-md:gap-8 px-3 pt-12.5 pb-18.75 max-lg:py-12 max-md:py-8 max-sm:py-4">
        {teamData.map((member) => (
          <div key={member.id}>
            <div className="flex flex-col items-center">
              {/* Image */}
              <div className="relative w-52 h-52 rounded-full overflow-hidden shadow-[0px_12px_105px_12px_#00000008]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name */}
              <h3 className="pt-8 font-bold leading-5.5 text-darkbrown max-lg:pt-6 max-md:pt-4 text-[22px] max-md:text-lg max-sm:text-base">
                {member.name}
              </h3>

              {/* Role */}
              <p className="text-lightbrown leading-6  max-md:leading-4 max-md:text-sm max-sm:text-xs pt-1.75">
                {member.role}
              </p>

              {/* Social */}
              <div className="flex gap-2.5 pt-5 max-md:pt-3 max-sm:pt-2">
                <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white hover:scale-105 duration-300">
                  <Facebookicon />
                </div>
                <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white hover:scale-105 duration-300">
                  <Instaicon />
                </div>
                <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white hover:scale-105 duration-300">
                  <Youtubeicon />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurTeam;
