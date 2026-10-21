import React from 'react'
import { homeCategories } from '../common/Helper'
import { RightArrow } from '../common/Icons'
import Button from '../common/Button'
import Link from 'next/link'

const Categories = () => {
  return (
    <div className='py-[142px_150px] max-w-[1520px] w-full mx-auto px-3'>
      
      <h2 className='heading text-center'>
        Explore Our <span className='text-pink'>Categories</span>
      </h2>

      <p className='text-lightbrown mt-[24px] text-center text-xl leading-[26px]'>
        Browse through our different categories to find your favorite ice cream treats.
      </p>

      <div className='grid max-sm:grid-cols-1 max-xl:grid-cols-3 max-lg:grid-cols-2 grid-cols-4 justify-between max-w-[1490px] w-full max-2xl:gap-[25px] gap-[30px] mt-10'>
        
        {homeCategories.map((items, index) => {
          return (
            <div
              key={index}
               style={{ backgroundImage: `url(${items.image})` }}
             className="rounded-[20px] h-[300px] sm:h-[350px] md:h-[380px] lg:h-[420px] xl:h-[458px] relative bg-center bg-cover bg-no-repeat"
            >
             <div className='absolute bottom-[14px] left-[11px] right-[11px] flex py-[10.5px] justify-between px-[22px] items-center rounded-[16px] bg-white'>
                
                <p className='text-[rgba(33,37,41,1)] text-[22px] max-md:text-[18px] leading-[22px] font-bold'>
                  {items.text}
                </p>

                <Button as={Link} href={`/shop?category=${encodeURIComponent(items.text === 'Ice Cream Cones' ? 'Cones' : items.text)}`} aria-label={`Browse ${items.text}`}
                  theme="primary"
                  height="h-[46px]"
                  width="w-[46px]"
                  icons={<RightArrow />}
                  type="button"
                >
                </Button>

              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default Categories
