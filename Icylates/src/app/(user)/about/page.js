/** @format */

import React from "react";
import CommonHero from '@/components/common/CommonHero';
import SignUp from '@/components/home/SignUp';
import Journey from "@/components/about-us/Journey";
import Misson from "@/components/about-us/Misson";
import Statics from "@/components/about-us/Statics";
import Team from "@/components/about-us/Team";

const page = () => {
  return (
    <>
      <CommonHero />
      <Journey />
      <Misson />
      <Statics />
      <Team />
      <SignUp />
    </>
  );
};

export default page;
