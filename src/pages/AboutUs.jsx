import { useState, useEffect, useRef } from 'react';
import { Camera, Heart, Users, Award, MapPin, Mail, Phone, ChevronDown, Aperture, Film, Sparkles } from 'lucide-react';

const AboutUs = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  const galleryImages = [
    { 
      src: 'https://drscdn.500px.org/photo/1090314433/q%3D75_m%3D600/v2?sig=da50f192b4b6013705c8ba1722af68a765bf98959e3e486d47ba9ae64329b404', // Replace with 500px image URL or local path
      alt: 'Gallery 1',
      link: 'https://500px.com/photo/1090314433/barred-eagle-owl-by-blackumist' 
    },
    { 
      src: 'https://drscdn.500px.org/photo/1100183631/q%3D75_m%3D600/v2?sig=db37b8b3ac4efe3fd9f98a76a39ea95c19b49b2b205dda9ac0462bc3d4dfa6aa',
      alt: 'Gallery 2',
      link: 'https://500px.com/photo/1100183631/mountain.-by-blackumist'
    },
    { 
      src: 'https://drscdn.500px.org/photo/1073421327/q%3D75_m%3D600/v2?sig=6b3a8b6a1e35b1a7e01d4c3af47583d202331fae75e4a4872ba8d9e01fa790fe',
      alt: 'Gallery 3',
      link: 'https://500px.com/photo/1073421327/horseriding-by-blackumist'
    },
    { 
      src: 'https://drscdn.500px.org/photo/1076290451/q%3D75_m%3D600/v2?sig=24c747d9351a5ebf4192308fe12c3d04e768af9b0eb0ab8633bff7dfac7e4789',
      alt: 'Gallery 4',
      link: 'https://500px.com/photo/1076290451/lcs-by-blackumist' 
    },
    { 
      src: 'https://drscdn.500px.org/photo/1107758655/q%3D75_m%3D600/v2?sig=de3d34bb12931d0a037d97ffd0ab76931ced17140fc5c54e4b49c7d52b2119ef',
      alt: 'Gallery 5',
      link: 'https://500px.com/photo/1107758655/wandering-by-blackumist'
    },
    { 
      src: 'https://drscdn.500px.org/photo/1077497364/q%3D75_m%3D600/v2?sig=109ccb2f49b03d853278c096f90e0029fa220cb3b3dd0fd4c518e3bd4ec75f23',
      alt: 'Gallery 6',
      link: 'https://500px.com/photo/1077497364/mall-in-semarang-by-blackumist'
    },
  ];

  const stats = [
    { icon: Camera, value: '1', label: 'Cameras Sold' },
    { icon: Users, value: '1', label: 'Happy Customers' },
    { icon: Award, value: '0.1', label: 'Years Experience' },
    { icon: Heart, value: '100%', label: 'Passion' },
  ];

  const team = [
    { name: 'Lorem Ipsum', role: 'Founder & CEO', image: '/images/team-1.jpg' },
    { name: 'Dolor Sit', role: 'Camera Expert', image: '/images/team-2.jpg' },
    { name: 'Amet Consectetur', role: 'Customer Relations', image: '/images/team-3.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-gray-950"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
          
          {/* Floating Camera Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${4 + i}s`,
                }}
              >
                <Aperture 
                  className="w-8 h-8 text-amber-500/20" 
                  style={{ transform: `rotate(${i * 60}deg)` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Sparkles className="w-4 h-4" />
            Est. 2025
          </div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-humane font-semibold text-white mb-6 animate-fade-in-up"
          >
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-gradient">
              Analog Alley
            </span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            A Store for Enthusiast Builded by Enthusiast
          </p>

          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            <a 
              href="#story" 
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Discover Our Story</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section 
        id="story"
        ref={setRef('story')}
        className={`py-24 px-4 transition-all duration-1000 ${
          isVisible.story ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10">
                <img 
                  src="/images/about-story.jpg" 
                  alt="Our Story" 
                  className="w-full h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-amber-500/30 rounded-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-2xl" />
              
              {/* Floating Badge */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-6 py-3 rounded-xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                <Film className="w-5 h-5 inline mr-2" />
                Since 2020
              </div>
            </div>

            {/* Content Side */}
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 mb-4">
                <div className="w-12 h-[2px] bg-amber-400" />
                <span className="text-sm font-semibold uppercase tracking-wider">Our Story</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Passion for <span className="text-amber-400">Photography</span> 
              </h2>
              
              <div className="space-y-4 text-white/70 text-lg leading-relaxed">
                <p>
                  Dreams built by dreams. Moments Captured per Second and legacy lives forever.
                </p>
                <p>
                  
                </p>
                <p>
                  For End Project of Praktikum PPB and as a portfolio, building Analog Alley to help photography enthusiast to get their dream camera and gears with affordable price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        id="stats"
        ref={setRef('stats')}
        className={`py-24 px-4 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent transition-all duration-1000 ${
          isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section 
        id="mission"
        ref={setRef('mission')}
        className={`py-24 px-4 transition-all duration-1000 ${
          isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 mb-4">
              <div className="w-12 h-[2px] bg-amber-400" />
              <span className="text-sm font-semibold uppercase tracking-wider">What We Believe</span>
              <div className="w-12 h-[2px] bg-amber-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Our Mission & Vision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-white/70 leading-relaxed">
                    To be the go-to destination for photography enthusiasts seeking quality equipment, exceptional service, and a supportive community that shares their passion for capturing life's moments.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-white/70 leading-relaxed">
                  Provides high-quality photography equipment to enthusiasts at affordable prices, fostering a community where passion for photography thrives and memories are captured beautifully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section 
        id="gallery"
        ref={setRef('gallery')}
        className={`py-24 px-4 transition-all duration-1000 ${
          isVisible.gallery ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 mb-4">
              <div className="w-12 h-[2px] bg-amber-400" />
              <span className="text-sm font-semibold uppercase tracking-wider">Gallery</span>
              <div className="w-12 h-[2px] bg-amber-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our <span className="text-amber-400">Moments</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our Favorite Photos with The Greatest Equipments
            </p>
          </div>

          {/* Masonry Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => {
              const ImageContent = (
                <>
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                      index === 0 || index === 3 ? 'h-full min-h-[400px]' : 'h-48 md:h-64'
                    }`}
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-${1516035069371 + index}-29a1b244cc32?w=600&h=${index === 0 || index === 3 ? 800 : 400}&fit=crop`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-medium">{image.alt}</p>
                  </div>
                </>
              );

              return image.link ? (
                <a 
                  key={index}
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                    index === 0 || index === 3 ? 'row-span-2' : ''
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {ImageContent}
                </a>
              ) : (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl ${
                    index === 0 || index === 3 ? 'row-span-2' : ''
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {ImageContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Contact CTA Section */}
      <section 
        id="contact"
        ref={setRef('contact')}
        className={`py-24 px-4 transition-all duration-1000 ${
          isVisible.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Get in <span className="text-amber-400">Touch</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Contact us to learn more about our myself and how we can work together.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>Semarang, Indonesia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>lacha@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Phone className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>08331143113</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
