import React from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Globe,
  MapPin,
  Calendar,
  Heart,
  Users,
  Cpu,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ImgOne from "../../assets/Obazee Felix.jpeg"
import ImgTwo from "../../assets/Odesanmi Victor.jpeg"

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Obazee Felix",
      role: "Founder & CEO",
      image: ImgOne,
      bio: "Visionary leader with 3+ years in tech entrepreneurship. Passionate about bridging the digital divide in Africa through innovative blockchain event solutions.",
      location: "Lagos, Nigeria",
      joinDate: "2025",
      skills: ["Blockchain", "Product Strategy", "Web3 Development", "Leadership", "Event Management","Developer"],
      social: {
        twitter: "skrillzofficial",
        linkedin: "skrillzofficial",
        github: "skrillzofficial",
        website: "obazee-felix-portfolio.vercel.app"
      }
    },
    {
      id: 2,
      name: "Odesanmi Victor",
      role: "Data-Driven Project Manager",
      image: ImgTwo,
      bio: "Tech operations expert and data-driven project manager with deep expertise in blockchain solutions and event management for the African market.",
      location: "Lagos, Nigeria",
      joinDate: "2025",
      skills: ["Tech Operations", "Data Analytics", "Project Management", "Blockchain", "System Architecture"],
      social: {
        twitter: "VictorOdesanmi1",
        linkedin: "victor-odesanmi-b98bba155",
        github: "Victorz-01",
        website: ""
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Applied w-11/12 mx-auto container here */}
      <div className="w-11/12 mx-auto container py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            MEET THE BUILDERS
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#FF6B35]">Tech</span> Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            We're a passionate team of innovators, builders, and visionaries dedicated to 
            transforming Africa's event ecosystem through cutting-edge blockchain technology.
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#FF6B35]" />
              {teamMembers.length} Tech Experts
            </div>
            <div className="flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Blockchain & Web3
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Lagos, Nigeria
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Building for Africa
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {teamMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Us in Building Africa's Event Future
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            We're always looking for talented individuals who are passionate about 
            technology, events, and making an impact across Africa.
          </p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#FF8535] transition-all hover:shadow-lg"
          >
            <Code2 className="h-5 w-5" />
            Contact Our Team
          </Link>
        </div>
      </div>
      
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

// Team Member Card Component with techy design
const TeamMemberCard = ({ member }) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col w-full max-w-md h-full">
      {/* Tech-inspired accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B35]" />
      
      {/* Member Image Container */}
      <div className="relative h-80 overflow-hidden bg-gray-100">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback if image fails to load */}
        <div 
          className="hidden w-full h-full bg-[#FF6B35] items-center justify-center text-white text-4xl font-bold"
        >
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        
        {/* Overlay with tech pattern */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        
        {/* Role badge */}
        <div className="absolute bottom-20 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-[#FF6B35] text-sm font-semibold">{member.role}</p>
        </div>
        
        {/* Name and location */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
          <div className="flex items-center text-white/90">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{member.location}</span>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">{member.bio}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 text-[#FF6B35] flex-shrink-0" />
            <span>Joined {member.joinDate}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-[#FF6B35]" />
            Core Technologies
          </h4>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 hover:bg-[#FF6B35] hover:text-white transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200 mt-auto">
          {member.social.twitter && (
            <a
              href={`https://twitter.com/${member.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#1DA1F2] transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-gray-50"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${member.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#0077B5] transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-gray-50"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.social.github && (
            <a
              href={`https://github.com/${member.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-700 transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-gray-50"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {member.social.website && (
            <a
              href={`https://${member.social.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#FF6B35] transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-gray-50"
            >
              <Globe className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;