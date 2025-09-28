import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const Home = () => {
  return (
    <div className="Homeimg Blend-overlay">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section Inline */}
      <div className="w-11/12 mx-auto container p-10">
        <div className="my-10 text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Discover Events That Inspire and Connect
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
              Your complete destination for discovering, booking, and experiencing events that truly&nbsp;matter&nbsp;to&nbsp;you.
            </p>
          </div>
          <div>
            <button className="duration-300 transform hover:scale-105 shadow-md ml-4 bg-white text-[#006F6A] px-8 py-2 rounded-full text-lg font-medium hover:bg-[#00E8D9] hover:text-white transition-colors">
              Create Your First Event
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
