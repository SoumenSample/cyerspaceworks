// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaWhatsapp,
//   FaMapMarkerAlt,
//   FaLinkedin,
// } from "react-icons/fa";
// import logo from "../public/logo.png";

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="bg-black text-white py-8 px-6 sm:px-6">
//       <div className="max-w-7xl mx-auto bg-gradient-to-r from-cyan-400 via-cyan-400/90 to-cyan-400/70 text-black rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col gap-8">
//         {/* Main Footer Content */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 text-center sm:text-left">
//           {/* Logo & About */}
//           <div className="flex flex-col items-center sm:items-start">
//             <Image
//               src={logo}
//               alt="logo"
//               width={120}
//               height={120}
//               className="cursor-pointer w-24 sm:w-32 md:w-36"
//             />
//             <p className="mt-3 text-slate-900 leading-relaxed text-sm sm:text-base max-w-[220px] sm:max-w-[250px]">
//              Discover endless possibilities in the{" "}
//               <span className="font-semibold text-black">Cyber-space</span>
//             </p>
//           </div>

//           {/* Useful Links */}
// <div>
//   <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
//     Useful Links
//   </h3>
//   <ul className="space-y-2 text-slate-900 text-sm sm:text-base">
//     {[
//       { href: "/", label: "Home" },
//       { href: "/services", label: "Services" },
//       { href: "/about-us", label: "About Us" },
//       { href: "/contact-us", label: "Contact Us" },
//       { href: "/privacy-policy", label: "Privacy Policy" },
//       { href: "/terms-and-conditions", label: "Terms & Conditions" },
//       { href: "/faq", label: "FAQ" },
//     ].map((link) => (
//       <li key={link.href}>
//         <Link
//           href={link.href}
//           className="relative hover:text-slate-700 transition duration-200 after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[2px] after:bg-slate-700 after:transition-all after:duration-300 hover:after:w-full"
//         >
//           {link.label}
//         </Link>
//       </li>
//     ))}
//   </ul>
// </div>

// {/* Services */}
// <div>
//   <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
//     Services
//   </h3>
//   <ul className="space-y-2 text-slate-900 text-sm sm:text-base">
//     {[
//       { href: "/services/web-development", label: "Web Development" },
//       { href: "/services/app-development", label: "App Development" },
//       { href: "/services/software-development", label: "Software Development" },
//       { href: "/services/ui-ux-design", label: "UI/UX Design" },
//       { href: "/services/digital-marketing", label: "Digital Marketing" },
//       { href: "/services/graphic-design", label: "Graphic Design" },
//       { href: "/services/research-and-analytics", label: "Research and Analytics" },
//     ].map((item) => (
//       <li key={item.href}>
//         <Link
//           href={item.href}
//           className="
//             relative inline-block 
//             hover:text-slate-700 
//             transition 
//             duration-200
//             after:absolute 
//             after:left-0 
//             after:-bottom-0.5 
//             after:w-0 
//             after:h-[2px] 
//             after:bg-slate-700 
//             after:transition-all 
//             after:duration-300 
//             hover:after:w-full
//           "
//         >
//           {item.label}
//         </Link>
//       </li>
//     ))}
//   </ul>
// </div>

//           {/* Contact */}
//           <div>
//             <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
//               Get In Touch
//             </h3>
//             <p className="text-slate-900 text-sm sm:text-base">
//   <a
//     href="tel:+917980715765"
//     className="hover:text-slate-700 transition"
//   >
//     +91 7980715765
//   </a>
// </p>
// <p className="text-slate-900 text-sm sm:text-base">
//   <a
//     href="mailto:cyberspaceworksofficial@gmail.com"
//     className="hover:text-slate-700 transition"
//   >
//     cyberspaceworksofficial@gmail.com
//   </a>
// </p>

//             {/* Social Media Links */}
//             <div className="flex justify-center sm:justify-start space-x-4 mt-4 text-black text-lg sm:text-xl">
//               <a
//                 href="https://www.facebook.com/profile.php?id=100086774724799"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <FaFacebookF className="cursor-pointer hover:scale-110 transition" />
//               </a>
//               <a
//                 href="https://www.instagram.com/cyberspaceworks"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <FaInstagram className="cursor-pointer hover:scale-110 transition" />
//               </a>
//               <a
//                 href="https://wa.me/917980715765"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <FaWhatsapp className="cursor-pointer hover:scale-110 transition" />
//               </a>
//               <a
//                 href="https://www.google.com/maps/place/Cyberspace+Works+-+Website,+Software+and+App+Developer+in+Howrah,+Kolkata/@22.6434765,88.3408238,716m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f89dd56c959339:0x59f91e11a807e487!8m2!3d22.6434765!4d88.3433987!16s%2Fg%2F11tfxl7lfx?authuser=0&entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D" 
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <FaMapMarkerAlt className="cursor-pointer hover:scale-110 transition" />
//               </a>
//               <a
//                 href="https://www.linkedin.com/company/cyberspace-works"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <FaLinkedin className="cursor-pointer hover:scale-110 transition" />
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Text */}
//         <div className="text-center text-slate-900 text-xs sm:text-sm border-t border-gray-300/30 pt-4">
//           © {currentYear} Cyberspace Works. All Rights Reserved.
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaLinkedin,
} from "react-icons/fa";
import logo from "../public/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-8 px-6 sm:px-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-cyan-400 via-cyan-400/90 to-cyan-400/70 text-black rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col gap-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 text-center sm:text-left">
          {/* Logo & About */}
          <div className="flex flex-col items-center sm:items-start">
            <Image
              src={logo}
              alt="logo"
              width={120}
              height={120}
              className="cursor-pointer w-24 sm:w-32 md:w-36"
            />
            <p className="mt-3 text-slate-900 leading-relaxed text-sm sm:text-base max-w-[220px] sm:max-w-[250px]">
              Discover endless possibilities in the{" "}
              <span className="font-semibold text-black">Cyber-space</span>
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
              Useful Links
            </h3>
            <ul className="space-y-2 text-slate-900 text-sm sm:text-base">
              {[
                { href: "/", label: "Home" },
                { href: "/services", label: "Services" },
                { href: "/about-us", label: "About Us" },
                { href: "/contact-us", label: "Contact Us" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms-and-conditions", label: "Terms & Conditions" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative hover:text-slate-700 transition duration-200 after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[2px] after:bg-slate-700 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
              Services
            </h3>
            <ul className="space-y-2 text-slate-900 text-sm sm:text-base">
              {[
                { href: "/services/ai-intelligent-systems", label: "AI & Intelligent Systems" }, // ✅ Added first
                { href: "/services/web-development", label: "Web Development" },
                { href: "/services/app-development", label: "App Development" },
                { href: "/services/software-development", label: "Software Development" },
                { href: "/services/ui-ux-design", label: "UI/UX Design" },
                { href: "/services/digital-marketing", label: "Digital Marketing" },
                { href: "/services/graphic-design", label: "Graphic Design" },
                { href: "/services/research-and-analytics", label: "Research and Analytics" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative inline-block hover:text-slate-700 transition duration-200 after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[2px] after:bg-slate-700 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
              Get In Touch
            </h3>
            <p className="text-slate-900 text-sm sm:text-base">
              <a href="tel:+917980715765" className="hover:text-slate-700 transition">
                +91 7980715765
              </a>
            </p>
            <p className="text-slate-900 text-sm sm:text-base">
              <a href="mailto:cyberspaceworksofficial@gmail.com" className="hover:text-slate-700 transition">
                cyberspaceworksofficial@gmail.com
              </a>
            </p>

            {/* Social Media Links */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-4 text-black text-lg sm:text-xl">
              <a href="https://www.facebook.com/profile.php?id=100086774724799" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="cursor-pointer hover:scale-110 transition" />
              </a>
              <a href="https://www.instagram.com/cyberspaceworks" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="cursor-pointer hover:scale-110 transition" />
              </a>
              <a href="https://wa.me/917980715765" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="cursor-pointer hover:scale-110 transition" />
              </a>
              <a href="https://www.google.com/maps/place/Cyberspace+Works+-+Website,+Software+and+App+Developer+in+Howrah,+Kolkata/@22.6434765,88.3408238,716m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f89dd56c959339:0x59f91e11a807e487!8m2!3d22.6434765!4d88.3433987!16s%2Fg%2F11tfxl7lfx?authuser=0&entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
                <FaMapMarkerAlt className="cursor-pointer hover:scale-110 transition" />
              </a>
              <a href="https://www.linkedin.com/company/cyberspace-works" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="cursor-pointer hover:scale-110 transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center text-slate-900 text-xs sm:text-sm border-t border-gray-300/30 pt-4">
          © {currentYear} Cyberspace Works. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;