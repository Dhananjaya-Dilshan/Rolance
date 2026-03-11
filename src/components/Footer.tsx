import Link from 'next/link'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone 
} from 'lucide-react'

const Footer = () => {
  return (
    <footer className='bg-gray-950 text-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div>
            <h3 className='text-2xl font-bold mb-4'>Rolanse</h3>
            <p className='text-gray-400 mb-4'>
              Transform your designs into profitable merchandise with our print-on-demand platform.
            </p>
            <div className='flex space-x-4'>
              <a href='https://facebook.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-500 transition'>
                <Facebook size={24} />
              </a>
              <a href='https://instagram.com' target='_blank' rel='noopener noreferrer' className='hover:text-pink-500 transition'>
                <Instagram size={24} />
              </a>
              <a href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-400 transition'>
                <Twitter size={24} />
              </a>
              <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-600 transition'>
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-xl font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <Link href='/about' className='text-gray-400 hover:text-white transition'>
                  About Us
                </Link>
              </li>
              <li>
                <Link href='/how-it-works' className='text-gray-400 hover:text-white transition'>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href='/pricing' className='text-gray-400 hover:text-white transition'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href='/become-seller' className='text-gray-400 hover:text-white transition'>
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className='text-xl font-semibold mb-4'>Legal</h4>
            <ul className='space-y-2'>
              <li>
                <Link href='/terms' className='text-gray-400 hover:text-white transition'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href='/privacy' className='text-gray-400 hover:text-white transition'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='/cookie-policy' className='text-gray-400 hover:text-white transition'>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href='/refund' className='text-gray-400 hover:text-white transition'>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='text-xl font-semibold mb-4'>Contact Us</h4>
            <ul className='space-y-3'>
              <li className='flex items-center'>
                <Mail size={20} className='mr-2 text-gray-400' />
                <a href='mailto:support@rolanse.com' className='text-gray-400 hover:text-white transition'>
                  support@rolanse.com
                </a>
              </li>
              <li className='flex items-center'>
                <Phone size={20} className='mr-2 text-gray-400' />
                <a href='tel:+1234567890' className='text-gray-400 hover:text-white transition'>
                  +94 (011) 567-890
                </a>
              </li>
              <li className='flex items-center'>
                <MapPin size={20} className='mr-2 text-gray-400' />
                <span className='text-gray-400'>
                  164/5 Rolance Street, Colombo City
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
          <p className='text-sm text-gray-400'>
            &copy; {new Date().getFullYear()} Rolanse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer