import React from 'react'
import BestSellsSwiper from '../common/BestSellsSwiper'

const BestSells = () => {
  return (
     <div className='  ' >
        
        <div className='max-w-[1134px] w-full px-3 py-[142px_162px] mx-auto '>
            <h2 className=' heading text-center relative z-2 '>
               Our <span className=' text-pink'>Best</span> Sellers
            </h2>
            <p  className='text-lightbrown mt-[18px] z-2 relative text-center text-xl leading-[26px]   '>
               Discover the favorites that keep our customers coming back for more.
            </p>
            {/* swiper */}
            <div className='mt-[50px]'>
               <BestSellsSwiper/>
                
 
            </div>
           

        </div>
        
         
    </div>
  )
}

export default BestSells