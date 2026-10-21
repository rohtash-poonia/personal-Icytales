import React from 'react'

import CommonHero from '@/components/common/CommonHero'
import Journey from '../../../components/about-us/Journey'
import Misson from '../../../components/about-us/Misson'
import Statics from '../../../components/about-us/Statics'
import SignUp from '@/components/home/SignUp'
import Team from '@/components/about-us/Team'

const page = () => {
  return (
    <div>
        <CommonHero/>
        <Journey/>
        <Misson/>
        <Statics/>
        <Team/>
        <SignUp/>
    </div>
  )
}

export default page
