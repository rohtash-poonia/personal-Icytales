import CommonHero from '@/components/common/CommonHero'
import LimitedOffer from '@/components/faq\'s/LimitedOffer'
import Questions from '@/components/faq\'s/Questions'
import SignUp from '@/components/home/SignUp'
import React from 'react'

const page = () => {
  return (
    <div>
      <CommonHero/>
      <Questions/>
      <LimitedOffer/>
      <SignUp/>
    </div>
  )
}

export default page