import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import DashboardPreview from '../components/DashboardPreview'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <CTA />
      <Footer />
    </div>
  )
}

export default Landing
