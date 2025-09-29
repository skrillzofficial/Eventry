import React from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Heart,
  Users,
  Star,
  ArrowRight
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
      },
      portfolio: {
        experience: [
          {
            company: "TechInnovate Africa",
            position: "Co-founder",
            duration: "2018-2023",
            description: "Led development of fintech solutions reaching 1M+ users across West Africa"
          },
          {
            company: "Google Nigeria",
            position: "Product Manager",
            duration: "2015-2018",
            description: "Managed Google Pay rollout in Nigeria, achieving 500K+ users in first year"
          }
        ],
        education: [
          {
            institution: "University of Lagos",
            degree: "B.Sc Computer Science",
            year: "2014"
          },
          {
            institution: "MIT Sloan",
            degree: "Executive MBA",
            year: "2020"
          }
        ],
        achievements: [
          "Forbes 30 Under 30 - Technology 2022",
          "TechCrunch Disrupt Finalist 2021",
          "Nigerian Innovation Award 2020"
        ]
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
      },
      portfolio: {
        experience: [
          {
            company: "Binance Africa",
            position: "Senior Blockchain Developer",
            duration: "2021-2023",
            description: "Built and audited smart contracts handling $50M+ in transactions"
          },
          {
            company: "Andela",
            position: "Technical Team Lead",
            duration: "2018-2021",
            description: "Led team of 15 developers building enterprise solutions for global clients"
          }
        ],
        education: [
          {
            institution: "Federal University of Technology, Minna",
            degree: "B.Eng Computer Engineering",
            year: "2017"
          }
        ],
        achievements: [
          "Ethereum Foundation Grant Recipient 2022",
          "Best Blockchain Solution - Naija Hackathon 2021",
          "Open Source Contributor - 50+ repositories"
        ]
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
      },
      portfolio: {
        experience: [
          {
            company: "Flutterwave",
            position: "Senior Product Designer",
            duration: "2020-2023",
            description: "Led design for merchant dashboard serving 50K+ businesses across Africa"
          },
          {
            company: "Konga",
            position: "UX Designer",
            duration: "2018-2020",
            description: "Redesigned checkout flow, increasing conversion by 35%"
          }
        ],
        education: [
          {
            institution: "Covenant University",
            degree: "B.Sc Industrial Design",
            year: "2017"
          },
          {
            institution: "Interaction Design Foundation",
            degree: "UX Certification",
            year: "2019"
          }
        ],
        achievements: [
          "African Design Award 2022",
          "Behance Featured Designer 2021",
          "Design Mentor - She Code Africa"
        ]
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
      },
      portfolio: {
        experience: [
          {
            company: "Paystack (Stripe)",
            position: "Backend Engineer",
            duration: "2019-2023",
            description: "Built payment processing systems handling 10M+ transactions monthly"
          },
          {
            company: "Interswitch",
            position: "Software Engineer",
            duration: "2017-2019",
            description: "Developed core banking systems for major Nigerian financial institutions"
          }
        ],
        education: [
          {
            institution: "University of Nigeria, Nsukka",
            degree: "B.Sc Software Engineering",
            year: "2016"
          }
        ],
        achievements: [
          "AWS Solutions Architect Certified",
          "Python Software Foundation Member",
          "Tech Speaker - PyCon Nigeria 2022"
        ]
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
      },
      portfolio: {
        experience: [
          {
            company: "Jumia Nigeria",
            position: "Growth Marketing Manager",
            duration: "2020-2023",
            description: "Led campaigns acquiring 2M+ new users and increasing retention by 40%"
          },
          {
            company: "Konga",
            position: "Digital Marketing Specialist",
            duration: "2018-2020",
            description: "Managed social media channels growing followers from 50K to 500K"
          }
        ],
        education: [
          {
            institution: "Bayero University Kano",
            degree: "B.Sc Marketing",
            year: "2017"
          },
          {
            institution: "Digital Marketing Institute",
            degree: "Professional Diploma",
            year: "2019"
          }
        ],
        achievements: [
          "Google Digital Marketing Certified",
          "Marketing Campaign of the Year - Nigerian Marketing Awards 2022",
          "Featured Speaker - Social Media Week Lagos"
        ]
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
      },
      portfolio: {
        experience: [
          {
            company: "MTN Nigeria",
            position: "Senior Mobile Developer",
            duration: "2020-2023",
            description: "Led development of MyMTN app with 5M+ downloads on Play Store"
          },
          {
            company: "Andela",
            position: "Mobile Engineer",
            duration: "2018-2020",
            description: "Built cross-platform apps for international clients including Microsoft and GitHub"
          }
        ],
        education: [
          {
            institution: "University of Benin",
            degree: "B.Eng Computer Engineering",
            year: "2017"
          }
        ],
        achievements: [
          "Flutter GDE (Google Developer Expert)",
          "Pub.dev Top Package Maintainer",
          "Mobile App Award - Naija Tech Awards 2021"
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen Homeimg Blend-overlay ">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We're a passionate team of innovators, builders, and visionaries dedicated to 
            transforming Africa's event ecosystem through blockchain technology.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {teamMembers.length} Amazing People
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Across Nigeria
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
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

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Globe className="h-8 w-8" />}
              title="Africa First"
              description="We build solutions specifically designed for African challenges and opportunities, understanding local contexts and needs."
            />
            <ValueCard
              icon={<Users className="h-8 w-8" />}
              title="Community Driven"
              description="Our platform thrives on community. We listen to our users and build features that serve real needs across Nigeria."
            />
            <ValueCard
              icon={<Award className="h-8 w-8" />}
              title="Excellence"
              description="We strive for technical excellence and outstanding user experiences in everything we build for our users."
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">
            Join Us in Building Africa's Event Future
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about 
            technology, events, and making an impact across Africa.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-[#006F6A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#005a55] transition-colors flex items-center">
              View Open Positions
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            <button className="border border-[#006F6A] text-[#006F6A] px-8 py-3 rounded-lg font-semibold hover:bg-[#006F6A] hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member }) => {
  const [showPortfolio, setShowPortfolio] = React.useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
        {/* Member Image and Basic Info */}
        <div className="relative">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-60 object-cover"
          />
          <div className="absolute inset-0" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
            <p className="text-[#00E8D9] font-medium">{member.role}</p>
          </div>
        </div>

        {/* Member Details */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            {member.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            Joined {member.joinDate}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {member.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  +{member.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {member.social.twitter && (
                <a
                  href={`https://twitter.com/${member.social.twitter}`}
                  className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {member.social.linkedin && (
                <a
                  href={`https://linkedin.com/in/${member.social.linkedin}`}
                  className="text-gray-400 hover:text-[#0077B5] transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {member.social.github && (
                <a
                  href={`https://github.com/${member.social.github}`}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {member.social.website && (
                <a
                  href={`https://${member.social.website}`}
                  className="text-gray-400 hover:text-[#006F6A] transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>

            <button
              onClick={() => setShowPortfolio(true)}
              className="text-[#006F6A] hover:text-[#005a55] text-sm font-medium flex items-center"
            >
              View Portfolio
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {showPortfolio && (
        <PortfolioModal member={member} onClose={() => setShowPortfolio(false)} />
      )}
    </>
  );
};

// Portfolio Modal Component
const PortfolioModal = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="relative">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-80 object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-green text-white p-2 rounded-full"
          >
            ✕
          </button>
          <div className="absolute bottom-6 left-6">
            <h2 className="text-3xl font-bold text-white mb-2">{member.name}</h2>
            <p className="text-[#00E8D9] text-lg font-medium">{member.role}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Bio and Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">{member.bio}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Contact & Links</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3" />
                  {member.location}
                </div>
                <div className="flex space-x-4">
                  {member.social.twitter && (
                    <a
                      href={`https://twitter.com/${member.social.twitter}`}
                      className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${member.social.linkedin}`}
                      className="text-gray-400 hover:text-[#0077B5] transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.github && (
                    <a
                      href={`https://github.com/${member.social.github}`}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.website && (
                    <a
                      href={`https://${member.social.website}`}
                      className="text-gray-400 hover:text-[#006F6A] transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {member.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-[#006F6A] text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Briefcase className="h-6 w-6 mr-3" />
              Professional Experience
            </h3>
            <div className="space-y-6">
              {member.portfolio.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-[#006F6A] pl-6 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="font-medium text-[#006F6A] mb-2">{exp.company}</p>
                  <p className="text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <GraduationCap className="h-6 w-6 mr-3" />
              Education
            </h3>
            <div className="space-y-4">
              {member.portfolio.education.map((edu, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="bg-[#006F6A] text-white px-3 py-1 rounded-full text-sm">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {member.portfolio.achievements && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-3" />
                Awards & Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.portfolio.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Value Card Component
const ValueCard = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="bg-[#006F6A] w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Team;