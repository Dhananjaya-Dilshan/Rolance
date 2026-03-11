"use client";

import Image from "next/image";

import Link from "next/link";
import { ShoppingCart, Upload, Globe, Star, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


const topEarners = [
  { 
    name: "Emily Rodriguez", 
    earnings: "$12,500", 
    image: "/user1.png",
    designs: "Custom Pet Portraits"
  },
  { 
    name: "Alex Chen", 
    earnings: "$9,800", 
    image: "/user4.png",
    designs: "Motivational Quotes"
  },
  { 
    name: "Sarah Thompson", 
    earnings: "$7,500", 
    image: "/user3.png",
    designs: "Minimalist Landscapes"
  }
];

const verticalImages = [
  // Phone Cases
  { 
    src: "/phone-case-1.png", 
    title: "Geometric Patterns", 
    category: "Phone Cases" 
  },
  { 
    src: "/phone-case-2.png", 
    title: "Nature Inspired", 
    category: "Phone Cases" 
  },
  { 
    src: "/phone-case-3.png", 
    title: "Abstract Art", 
    category: "Phone Cases" 
  },
  // T-Shirts
  { 
    src: "/tshirt-1.png", 
    title: "Urban Typography", 
    category: "T-Shirts" 
  },
  { 
    src: "/tshirt-2.png", 
    title: "Minimalist Design", 
    category: "T-Shirts" 
  },
  { 
    src: "/tshirt-3.png", 
    title: "Vintage Concept", 
    category: "T-Shirts" 
  },
  // Mugs
  { 
    src: "/mug-1.png", 
    title: "Cosmic Print", 
    category: "Mugs" 
  },
  { 
    src: "/mug-2.png", 
    title: "Watercolor Splash", 
    category: "Mugs" 
  },
  { 
    src: "/mug-3.png", 
    title: "Artistic Illustration", 
    category: "Mugs" 
  }
];



const ScrollingDesignSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Separate images by category
  const phoneCases = verticalImages.filter(img => img.category === "Phone Cases");
  const tShirts = verticalImages.filter(img => img.category === "T-Shirts");
  const mugs = verticalImages.filter(img => img.category === "Mugs");

  // Create looped arrays for each category
  const loopedPhoneCases = [...phoneCases, ...phoneCases, ...phoneCases];
  const loopedTShirts = [...tShirts, ...tShirts, ...tShirts];
  const loopedMugs = [...mugs, ...mugs, ...mugs];

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  const features = [
    {
      icon: Upload,
      title: "Design & Upload",
      description: "Create or upload your unique designs effortlessly.",
      color: "text-blue-500"
    },
    {
      icon: Globe,
      title: "Local Print Shops",
      description: "Connect with nearby printing shops instantly.",
      color: "text-green-500"
    },
    {
      icon: ShoppingCart,
      title: "Sell Worldwide",
      description: "Reach global customers with print-on-demand.",
      color: "text-purple-500"
    }
  ];
  

  return (
    <section 
      ref={ref} 
      className="relative bg-white py-20 overflow-hidden"
      style={{ 
        height: "150vh",
        position: "relative"
      }}
    >
      <div className="container mx-auto px-4 absolute top-0 left-0 right-0 z-10">
        
        
        <div className="hidden md:flex justify-center space-x-6 mt-16 relative">
          <motion.div 
            style={{ y: y1 }} 
            className="flex flex-col space-y-6 w-1/4"
          >
            {loopedPhoneCases.slice(0, 9).map((design, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <Image 
                  src={design.src} 
                  alt={design.title} 
                  width={400} 
                  height={400} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{design.title}</h3>
                  <p className="text-gray-500">{design.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          <motion.div 
            style={{ y: y2 }} 
            className="flex flex-col space-y-6 w-1/4"
          >
            {loopedTShirts.slice(0, 9).map((design, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <Image 
                  src={design.src} 
                  alt={design.title} 
                  width={400} 
                  height={400} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{design.title}</h3>
                  <p className="text-gray-500">{design.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          <motion.div 
            style={{ y: y3 }} 
            className="flex flex-col space-y-6 w-1/4"
          >
            {loopedMugs.slice(0, 9).map((design, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <Image 
                  src={design.src} 
                  alt={design.title} 
                  width={400} 
                  height={400} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{design.title}</h3>
                  <p className="text-gray-500">{design.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Fallback */}
        <div className="md:hidden grid grid-cols-2 gap-4 mt-16">
          {verticalImages.map((design, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Image 
                src={design.src} 
                alt={design.title} 
                width={400} 
                height={400} 
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{design.title}</h3>
                <p className="text-gray-500">{design.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-600 to-purple-400 overflow-hidden">
      <motion.section
        className="relative min-h-screen flex items-center justify-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/purple-galaxy-bg.png"
            alt="Cosmic Purple Background"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="text-center z-10 space-y-10">
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold tracking-tight drop-shadow-lg"
            initial={{ y: -150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
             Your Design, Our Prints
          </motion.h1>
          <motion.p
            className="text-xl md:text-3xl max-w-2xl mx-auto font-light"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Design your own phone cases, mugs, and T-shirts printed locally, delivered fast.
          </motion.p>
          <motion.div
            className="flex justify-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <Link href="/design">
              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-purple-900 font-bold rounded-full shadow-xl hover:shadow-yellow-500/50"
                whileHover={{ scale: 1.15, rotate: 2 }}
              >
                Start Designing
              </motion.button>
            </Link>
            <Link href="/shops">
              <motion.button
                className="px-10 py-4 bg-white text-purple-700 font-bold rounded-full shadow-xl hover:shadow-purple-500/50"
                whileHover={{ scale: 1.15, rotate: -2 }}
              >
                Find Products
              </motion.button>
            </Link>
          </motion.div>
        </div>
  
        <motion.div
          className="absolute top-20 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        ></motion.div>
      </motion.section>

      {/* Features Section with Slide-in Animation */}

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
          {["Upload", "Connect", "Deliver"].map((feature, index) => (
              <motion.div
              key={feature}
                className="text-center p-6 bg-gray-100 rounded-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
              <Image
                  src={`/${feature.toLowerCase()}.png`}
                  alt={feature}
                  width={120}
                  height={120}
                  className="mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold mb-4">{feature}</h3>
                <p className="text-gray-600 text-lg md:text-2xl">
                  {feature === "Upload" &&
                    "Upload your designs quickly and securely."}

                  {feature === "Connect" &&
                    "Find and partner with local print shops."}

                  {feature === "Deliver" &&
                    "Get your printed products delivered quickly."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Call-to-Action Section */}

      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <motion.div
          className="max-w-5xl mx-auto text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Printing?
          </h2>

          <p className="text-lg md:text-2xl pb-8">
            Join thousands of creative individuals transforming their ideas into
            reality.
          </p>

          <Link href="/signup">
            <motion.button
              className="px-8 py-3 bg-white text-indigo-500 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
              whileHover={{ scale: 1.1 }}
            >
              Sign Up Now
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          className="absolute left-10 bottom-10 w-32 h-32 bg-purple-300 rounded-full opacity-50"
          animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        ></motion.div>
      </section>

     
      <div className="pt-10 pb-10 bg-white">
  <motion.h2 
    className="text-4xl font-bold text-center mb-16 text-gray-800 sticky top-20 z-20 bg-white py-4"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    Discover Trending Designs
  </motion.h2>
  <ScrollingDesignSection />
</div>


      

    {/* Local Shops Section */}
    <section className="py-20 bg-gradient-to-b from-purple-600 to-purple-900 text-white">
        <motion.div
          className="max-w-6xl mx-auto text-center space-y-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold"> Connect with local printing shops and bring your designs to life.
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Choose from hundreds of local printing shops to bring your designs to life fast and sustainable.
          </p>
          <div className="relative w-full h-96 bg-purple-700 rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/map-bg.png"
              alt="Local Shops Map"
              fill
              className="object-cover opacity-60"
            />
            
          </div>
        </motion.div>
      </section>



      <section id="features" className="py-16 bg-white">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
        

          <motion.div
          className="max-w-5xl mx-auto text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Maximize Your Earning
          </h2>

          <p className="text-lg md:text-2xl pb-8">
            Unlock the Power of Personalized Merchandise. Streamline Your
            Production, Expand Your Reach, and Boost Your Income. Join Rolanse
            and Revolutionize Your Business Today
          </p>

        
        </motion.div>
        </motion.div>
          {/* Top Earners */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
     
          <div className="grid md:grid-cols-3 gap-8">
            {topEarners.map((earner, index) => (
              <motion.div
                key={earner.name}
                className="bg-gray-100 rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
<Image 
                  src={earner.image} 
                  alt={earner.name} 
                  width={500} 
                  height={400} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{earner.name}</h3>
                  <p className="text-purple-600 font-medium mb-2">
                    <TrendingUp className="inline mr-2" size={20} />
                    {earner.earnings} Earned
                  </p>
                  <p className="text-gray-600">
                    <Star className="inline mr-2" size={20} />
                    {earner.designs}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
        
      </section>

      {/* Animated Call-to-Action Section */}

      <section className="py-24 bg-purple-900 text-white relative">
        <div className="absolute inset-0">
          <Image
            src="/purple-wave-bg.png"
            alt="Wavy Purple Background"
            fill
            className="object-cover opacity-25"
          />
        </div>
        <motion.div
          className="max-w-5xl mx-auto text-center space-y-8 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold">
            Your Vision, Printed Perfectly
          </h2>
          <p className="text-xl md:text-3xl">
          Experience the Convenience and Flexibility of Print-on-Demand.

Elevate Your Brand, Expand Your Reach, and Discover the Endless Possibilities of

Customized Merchandise.
          </p>
          <Link href="/signup">
            
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
