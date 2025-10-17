import React from "react";
import { Link } from "react-router-dom";
import Brandlogo from "../../assets/eventry white logo.PNG";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="w-11/12 mx-auto container py-8">
        {/* Brand + Tagline */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <div className="flex items-center space-x-2">
            <img className="h-13 w-auto" src={Brandlogo} alt="Eventry Logo" />
            <span className="text-xl font-bold tracking-wide">Eventry</span>
          </div>
          <p className="text-xs md:text-sm text-start max-w-md">
            Fraud-Proof, Low-Fee Ticketing Powered by Solana
          </p>
        </div>

        {/* Links & Social */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#00FFD1] transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-[#00FFD1] transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="hover:text-[#00FFD1] transition-colors">
              <Linkedin size={18} />
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex space-x-6 text-sm">
            <Link 
              to="/team" 
              className="hover:text-[#00FFD1] transition-colors"
            >
              Team
            </Link>
            <a href="#" className="hover:text-[#00FFD1] transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-[#00FFD1] transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs border-t border-[#C9E9E7]/10 pt-4">
          © {new Date().getFullYear()} Eventry. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;