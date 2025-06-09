// Footer.js
import {
  FaBriefcase,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaBriefcase className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">WorkSphere</span>
            </div>
            <p className="text-sm">
              Connecting talent with opportunity through AI-powered job
              matching.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Job Search
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className="hover:text-white transition-colors"
                >
                  Company Directory
                </Link>
              </li>
              <li>
                <Link
                  to="/salary-guide"
                  className="hover:text-white transition-colors"
                >
                  Salary Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/career-tools"
                  className="hover:text-white transition-colors"
                >
                  Career Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Career Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/webinars"
                  className="hover:text-white transition-colors"
                >
                  Webinars
                </Link>
              </li>
              <li>
                <Link
                  to="/partners"
                  className="hover:text-white transition-colors"
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                aria-label="Email newsletter subscription"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaEnvelope className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <Link
                to="/privacy"
                className="text-sm hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-sm hover:text-white transition-colors"
              >
                Cookie Settings
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CareerHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
