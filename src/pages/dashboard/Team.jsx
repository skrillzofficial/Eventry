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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ImgOne from "../../assets/fedrick.jpg"
import ImgTwo from "../../assets/gold.jpg"

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Obazee Felix",
      role: "Founder & CEO",
      image: ImgOne,
      bio: "Visionary leader with 10+ years in tech entrepreneurship. Passionate about bridging the digital divide in Africa through innovative event solutions.",
      location: "Lagos, Nigeria",
      joinDate: "2023",
      skills: ["Blockchain", "Product Strategy", "Leadership", "Event Management"],
      social: {
        twitter: "adeola_j",
        linkedin: "adeolajohnson",
        github: "adeola-tech",
        website: "adeola.dev"
      }
    },
    {
      id: 2,
      name: "Odesanmi Victor",
      role: "CTO Lead",
      image: ImgTwo,
      bio: "Blockchain expert and full-stack developer with deep expertise in smart contracts and decentralized applications for the African market.",
      location: "Abuja, Nigeria",
      joinDate: "2023",
      skills: ["Solidity", "React", "Node.js", "Smart Contracts", "Web3"],
      social: {
        twitter: "chinedu_web3",
        linkedin: "chineduokoro",
        github: "chinedu-dev",
        website: "chinedu.tech"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#FF6B35]">Dream</span> Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're a passionate team of innovators, builders, and visionaries dedicated to 
            transforming Africa's event ecosystem through blockchain technology.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-[#FF6B35]" />
              {teamMembers.length} Amazing People
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-[#FF6B35]" />
              Across Nigeria
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-[#FF6B35]" />
              Building for Africa
            </div>
          </div>
        </div>

        {/* Team Grid - Centered with 2 columns max */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {teamMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join Us in Building Africa's Event Future
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about 
            technology, events, and making an impact across Africa.
          </p>
          <Link 
            to="/contact"
            className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
          >
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

// Team Member Card Component with better image handling
const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full">
      {/* Member Image Container */}
      <div className="relative h-80 overflow-hidden bg-gray-100">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback if image fails to load */}
        <div 
          className="hidden w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF8535] items-center justify-center text-white text-4xl font-bold"
        >
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-[#FF6B35] font-medium">{member.role}</p>
        </div>
      </div>

      {/* Member Details */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 text-sm mb-4 flex-1">{member.bio}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-[#FF6B35] flex-shrink-0" />
            <span>{member.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 text-[#FF6B35] flex-shrink-0" />
            <span>Joined {member.joinDate}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {member.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="bg-[#FF6B35]/10 text-[#FF6B35] px-3 py-1 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                +{member.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 pt-4 border-t border-gray-100 mt-auto">
          {member.social.twitter && (
            <a
              href={`https://twitter.com/${member.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#1DA1F2] transition-colors transform hover:scale-110"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${member.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#0077B5] transition-colors transform hover:scale-110"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.social.github && (
            <a
              href={`https://github.com/${member.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-700 transition-colors transform hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {member.social.website && (
            <a
              href={`https://${member.social.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#FF6B35] transition-colors transform hover:scale-110"
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