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
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ImgOne from "../../assets/fedrick.jpg"
import ImgTwo from "../../assets/gold.jpg"
import ImgThree from "../../assets/Testimonial1.png"
import ImgFour from "../../assets/Testimonial2.png"
import ImgFive from "../../assets/Testimonial3.png"
import ImgSix from "../../assets/busayo.jpg"

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
      name: "Obazee Samuel",
      role: "CTO & Blockchain Lead",
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
    },
    {
      id: 3,
      name: "Adetayo Mathew",
      role: "Head of Product Design",
      image: ImgThree,
      bio: "User experience designer passionate about creating intuitive, accessible digital experiences that serve diverse African users.",
      location: "Ibadan, Nigeria",
      joinDate: "2023",
      skills: ["UI/UX Design", "Figma", "User Research", "Prototyping", "Design Systems"],
      social: {
        twitter: "funmi_designs",
        linkedin: "funmilayoadebayo",
        github: "funmi-ui",
        website: "funmi.design"
      }
    },
    {
      id: 4,
      name: "Emeka Nwosu",
      role: "Lead Backend Engineer",
      image: ImgFour,
      bio: "Backend specialist focused on building scalable, secure systems that can handle Africa's growing digital infrastructure demands.",
      location: "Port Harcourt, Nigeria",
      joinDate: "2023",
      skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker", "Redis"],
      social: {
        twitter: "emeka_devops",
        linkedin: "emekanwosu",
        github: "emeka-backend",
        website: "emeka.dev"
      }
    },
    {
      id: 5,
      name: "Zainab Bello",
      role: "Marketing & Growth Lead",
      image: ImgFive,
      bio: "Growth marketing expert with proven track record of building communities and driving user acquisition across African markets.",
      location: "Kano, Nigeria",
      joinDate: "2023",
      skills: ["Digital Marketing", "Community Building", "Growth Hacking", "Content Strategy", "SEO"],
      social: {
        twitter: "zainab_growth",
        linkedin: "zainabbello",
        github: "zainab-mkt",
        website: "zainabgrowth.com"
      }
    },
    {
      id: 6,
      name: "David Chukwuma",
      role: "Mobile Lead Engineer",
      image: ImgSix,
      bio: "Mobile development specialist creating performant, user-friendly applications optimized for African network conditions and devices.",
      location: "Enugu, Nigeria",
      joinDate: "2023",
      skills: ["Flutter", "React Native", "iOS", "Android", "Firebase", "REST APIs"],
      social: {
        twitter: "david_mobile",
        linkedin: "davidchukwuma",
        github: "david-flutter",
        website: "davidmobile.dev"
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

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
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
          <button className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors">
            Contact Our Team
          </button>
        </div>
      </div>
      
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

// Simplified Team Member Card Component
const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all overflow-hidden group">
      {/* Member Image and Basic Info */}
      <div className="relative">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-60 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-[#FF6B35] font-medium">{member.role}</p>
        </div>
      </div>

      {/* Member Details */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-2 text-[#FF6B35]" />
          {member.location}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-2 text-[#FF6B35]" />
          Joined {member.joinDate}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-[#FF6B35]/10 text-[#FF6B35] px-3 py-1 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 pt-4 border-t border-gray-100">
          {member.social.twitter && (
            <a
              href={`https://twitter.com/${member.social.twitter}`}
              className="text-gray-400 hover:text-[#1DA1F2] transition-colors transform hover:scale-110"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${member.social.linkedin}`}
              className="text-gray-400 hover:text-[#0077B5] transition-colors transform hover:scale-110"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.social.github && (
            <a
              href={`https://github.com/${member.social.github}`}
              className="text-gray-400 hover:text-gray-700 transition-colors transform hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {member.social.website && (
            <a
              href={`https://${member.social.website}`}
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