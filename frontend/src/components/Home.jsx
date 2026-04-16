import React from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJob from './LatestJob'
import Footer from './Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import SocialFeed from './feed/SocialFeed'


const Home = () => {
  useGetAllJobs();
  return (
    <div>
      <Navbar/>
      <HeroSection/>
      <CategoryCarousel/>
      <LatestJob/>
      <SocialFeed/>
      <Footer/>
    </div>
  )
}

export default Home
