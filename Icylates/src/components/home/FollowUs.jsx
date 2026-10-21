import React from 'react'
import { Follow } from '../common/Helper'
import Image from 'next/image'

const FollowUs = () => {
  return (
   <div className="bg-gradient-to-tr from-[#EFD7EF] via-[#F5F9FC] via-[#F8EAE1] to-[#EAF8F9] py-[142px_145px]">
    <div className=' max-w-[1960px] w-full px-4 relative'>
<div className='max-w-[1441px] w-full mx-auto px-3 '>
    <div className=' w-[129px] h-[129px] rounded-[129px] absolute top-[122px] left-[201px] bg-pink max-xl:opacity-40 max-md:opacity-15  '>

    </div>
    <div className=' w-[129px] h-[129px] rounded-[129px] absolute bottom-[-40px] right-[197px] bg-darkpurple max-xl:opacity-40  max-md:opacity-15  '>

    </div>
    <h2 className=' heading text-center  '>
             Follow Us on <span className='text-pink'> Instagram</span>
            </h2>
            <p  className='text-lightbrown mt-[28px] text-center text-xl leading-[26px]   '>
              Join our Instagram community for updates, special deals, and more!
            </p>
            <div className=' mt-[50px]  grid max-xl:grid-cols-4 max-lg:grid-cols-3  max-sm:grid-cols-1  max-md:grid-cols-2 grid-cols-5 relative z-3 gap-[25px] justify-between
            '>
           {
  Follow.map((items, index) => (
    <div className='mx-auto' key={index}>
      <Image
        src={items.image}
        height={326}
        width={263}
        alt="FollowUs"
      />
    </div>
  ))
}



                
            </div>

</div>
</div>
</div>

  )
}

export default FollowUs