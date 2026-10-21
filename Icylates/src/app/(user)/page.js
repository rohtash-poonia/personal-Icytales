
import ScrollToTop from "@/components/common/ScrollToTop";
import BestSells from "@/components/home/BestSells";
import Categories from "@/components/home/Categories";
import Explore from "@/components/home/Explore";
import Favourite from "@/components/home/Favourite";
import FollowUs from "@/components/home/FollowUs";
import HappyCustomer from "@/components/home/HappyCustomer";
import HeroSection from "@/components/home/HeroSection";
import SignUp from "@/components/home/SignUp";
import SummerSpecial from "@/components/home/SummerSpecial";

export default function Home() {
  return (
    <>
      {/* Shared gradient parent for Header + Hero */}
      <div className="bg-[linear-gradient(120deg,#EFD7EF,#F5F9FC,#F8EAE1,#EAF8F9)] -mt-21 pt-21 bg-cover bg-no-repeat">
        <HeroSection />
        <ScrollToTop/>
      </div>
    
    <Explore/>
     <Favourite/>
     <Categories/>
     <SummerSpecial/>
     <BestSells/>
     <HappyCustomer/>
     <SignUp/>
     <FollowUs/>
    </>
  );
}
