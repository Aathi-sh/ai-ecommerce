// src/components/logoSplash.js
'use client';

import { useEffect, useRef, useState } from 'react';

export default function LogoSplash({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const bgParticlesRef = useRef(null);
  const glowOrbRef = useRef(null);
  const logoIconRef = useRef(null);
  const logoTextWrapperRef = useRef(null);
  const taglineRef = useRef(null);
  const websiteRef = useRef(null);
  const shimmerRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const greenArcRef = useRef(null);
  const mainCircleRef = useRef(null);
  const sLetterRef = useRef(null);
  const chatTailRef = useRef(null);

  // Create background particles
  const createBgParticles = () => {
    const container = bgParticlesRef.current;
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'bg-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(particle);
    }
  };

  const animateBgParticles = () => {
    const particles = document.querySelectorAll('.bg-particle');
    particles.forEach((particle, i) => {
      setTimeout(() => {
        particle.style.transition = 'all 2s ease-out';
        particle.style.opacity = '1';
        particle.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`;

        setTimeout(() => {
          particle.style.opacity = '0';
        }, 1500);
      }, i * 20);
    });
  };

  // Main animation
  const animate = () => {
    const logoIcon = logoIconRef.current;
    const logoTextWrapper = logoTextWrapperRef.current;
    const letters = document.querySelectorAll('.letter');
    const tagline = taglineRef.current;
    const taglineWords = document.querySelectorAll('.tagline-word');
    const dots = document.querySelectorAll('.dot-separator');
    const website = websiteRef.current;
    const glowOrb = glowOrbRef.current;
    const shimmer = shimmerRef.current;
    const greenArc = greenArcRef.current;
    const mainCircle = mainCircleRef.current;
    const sLetter = sLetterRef.current;
    const chatTail = chatTailRef.current;

    if (!logoIcon || !logoTextWrapper || !glowOrb || !tagline || !website) return;

    // Reset everything
    logoIcon.style.opacity = '0';
    logoIcon.style.transform = 'scale(0) rotate(-180deg)';
    logoTextWrapper.style.opacity = '0';
    logoTextWrapper.style.transform = 'translateX(-50px)';
    glowOrb.style.opacity = '0';
    tagline.style.opacity = '0';
    website.style.opacity = '0';
    website.style.transform = 'translateY(20px)';

    letters.forEach(letter => {
      letter.style.opacity = '0';
      letter.style.transform = 'translateY(100px) rotateX(90deg)';
    });

    taglineWords.forEach(word => {
      word.style.opacity = '0';
      word.style.transform = 'translateY(20px) scale(0.8)';
    });

    dots.forEach(dot => {
      dot.style.opacity = '0';
      dot.style.transform = 'scale(0)';
    });

    if (greenArc) greenArc.setAttribute('opacity', '0');
    if (mainCircle) mainCircle.setAttribute('opacity', '0');
    if (sLetter) sLetter.setAttribute('opacity', '0');
    if (chatTail) chatTail.setAttribute('opacity', '0');

    // Create and animate background particles
    createBgParticles();
    setTimeout(() => animateBgParticles(), 100);

    // Step 1: Glow orb appears (0.3s)
    setTimeout(() => {
      glowOrb.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      glowOrb.style.opacity = '1';
      glowOrb.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }, 300);

    // Step 2: Logo icon spins in (0.5s)
    setTimeout(() => {
      logoIcon.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      logoIcon.style.opacity = '1';
      logoIcon.style.transform = 'scale(1) rotate(0deg)';
    }, 500);

    // Step 3: Circle appears first (0.8s)
    setTimeout(() => {
      if (mainCircle) {
        mainCircle.style.transition = 'opacity 0.4s ease';
        mainCircle.setAttribute('opacity', '1');
      }
    }, 800);

    // Step 4: Green arc sweeps in (1.0s)
    setTimeout(() => {
      if (greenArc) {
        greenArc.style.transition = 'opacity 0.5s ease';
        greenArc.setAttribute('opacity', '1');
      }
    }, 1000);

    // Step 5: S letter appears (1.3s)
    setTimeout(() => {
      if (sLetter) {
        sLetter.style.transition = 'opacity 0.4s ease';
        sLetter.setAttribute('opacity', '1');
      }
    }, 1300);

    // Step 6: Chat tail appears (1.5s)
    setTimeout(() => {
      if (chatTail) {
        chatTail.style.transition = 'opacity 0.3s ease';
        chatTail.setAttribute('opacity', '1');
      }
    }, 1500);

    // Step 7: Energy rings pulse (1.6s)
    setTimeout(() => {
      const rings = [ring1Ref.current, ring2Ref.current, ring3Ref.current];
      rings.forEach((ring, idx) => {
        if (!ring) return;
        const num = idx + 1;
        setTimeout(() => {
          ring.style.transition = 'all 0.8s ease-out';
          ring.style.width = (140 + num * 40) + 'px';
          ring.style.height = (140 + num * 40) + 'px';
          ring.style.opacity = '0.6';

          setTimeout(() => {
            ring.style.opacity = '0';
            ring.style.width = (140 + num * 80) + 'px';
            ring.style.height = (140 + num * 80) + 'px';
          }, 400);
        }, num * 100);
      });
    }, 1600);

    // Step 8: Text wrapper slides in (1.8s)
    setTimeout(() => {
      logoTextWrapper.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      logoTextWrapper.style.opacity = '1';
      logoTextWrapper.style.transform = 'translateX(0)';
    }, 1800);

    // Step 9: Letters drop in one by one (2.0s)
    letters.forEach((letter, i) => {
      setTimeout(() => {
        letter.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0) rotateX(0)';
      }, 2000 + i * 60);
    });

    // Step 10: Tagline words and dots appear (2.6s)
    setTimeout(() => {
      tagline.style.transition = 'all 0.5s ease';
      tagline.style.opacity = '1';

      taglineWords.forEach((word, i) => {
        setTimeout(() => {
          word.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          word.style.opacity = '1';
          word.style.transform = 'translateY(0) scale(1)';
        }, i * 200);
      });

      dots.forEach((dot, i) => {
        setTimeout(() => {
          dot.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          dot.style.opacity = '1';
          dot.style.transform = 'scale(1)';
        }, 100 + i * 200);
      });
    }, 2600);

    // Step 11: Website appears (3.0s)
    setTimeout(() => {
      website.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      website.style.opacity = '1';
      website.style.transform = 'translateY(0)';
    }, 3000);

    // Step 12: Shimmer effect (3.2s)
    setTimeout(() => {
      if (shimmer) {
        shimmer.style.transition = 'left 1.2s ease, opacity 0.3s ease';
        shimmer.style.opacity = '1';
        shimmer.style.left = '100%';

        setTimeout(() => {
          if (shimmer) shimmer.style.opacity = '0';
        }, 800);
      }
    }, 3200);

    // Step 13: Float animation for S circle (3.5s) - moves up and down twice
    setTimeout(() => {
      // Add the floating animation class to the logo icon (S circle)
      logoIcon.classList.add('floating');
      
      // Let the float animation play for 2 cycles (about 2 seconds)
      // Then fade out and transition to app
      setTimeout(() => {
        // Remove floating class to stop animation
        logoIcon.classList.remove('floating');
        
        // Add a subtle final glow
        logoIcon.style.transition = 'box-shadow 0.3s ease';
        logoIcon.style.filter = 'drop-shadow(0 0 12px rgba(0, 168, 89, 0.5))';
        
        // Start fade out of splash screen
        setTimeout(() => {
          setIsFadingOut(true);
          
          // Wait for fade out animation to complete
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
          }, 600);
        }, 300);
      }, 1800); // Let float animation run for 1.8 seconds (about 2 cycles)
    }, 3500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      animate();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 0.6s ease-out, visibility 0.6s ease-out;
          opacity: 1;
          visibility: visible;
        }

        .splash-container.fade-out {
          opacity: 0;
          visibility: hidden;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Background particles */
        .bg-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .bg-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(0, 168, 89, 0.3);
          border-radius: 50%;
          opacity: 0;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 1400px;
          height: 700px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .logo-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Circular Logo Icon */
        .logo-icon {
          position: relative;
          width: 140px;
          height: 140px;
          opacity: 0;
          transform: scale(0) rotate(-180deg);
        }

        /* Logo Text */
        .logo-text-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateX(-50px);
        }

        .main-text {
          font-size: 85px;
          font-weight: 800;
          color: #1E3A4C;
          letter-spacing: -2px;
          display: flex;
          overflow: hidden;
        }

        .letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(100px) rotateX(90deg);
        }

        .tagline {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 24px;
          color: #5a6c7d;
          font-weight: 500;
          opacity: 0;
        }

        .tagline-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px) scale(0.8);
        }

        .dot-separator {
          width: 7px;
          height: 7px;
          background: #00A859;
          border-radius: 50%;
          opacity: 0;
          transform: scale(0);
        }

        .website {
          font-size: 26px;
          color: #00A859;
          font-weight: 700;
          margin-top: 5px;
          opacity: 0;
          transform: translateY(20px);
          letter-spacing: -0.5px;
        }

        /* Energy rings */
        .energy-ring {
          position: absolute;
          border: 2px solid #00A859;
          border-radius: 50%;
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
        }

        /* Glow orb */
        .glow-orb {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 168, 89, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          top: 50%;
          left: 20%;
          transform: translate(-50%, -50%);
          opacity: 0;
          filter: blur(40px);
        }

        /* Shimmer effect */
        .shimmer {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: -100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          opacity: 0;
          pointer-events: none;
        }

        /* Floating animation for S circle - moves up and down */
        @keyframes float {
          0% { 
            transform: translateY(0px) scale(1); 
          }
          25% { 
            transform: translateY(-12px) scale(1.02); 
          }
          50% { 
            transform: translateY(0px) scale(1); 
          }
          75% { 
            transform: translateY(-8px) scale(1.01); 
          }
          100% { 
            transform: translateY(0px) scale(1); 
          }
        }

        .floating {
          animation: float 0.9s cubic-bezier(0.4, 0, 0.2, 1) 2 !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-text {
            font-size: 45px;
          }
          .logo-icon {
            width: 90px;
            height: 90px;
          }
          .logo-icon svg {
            width: 90px;
            height: 90px;
          }
          .tagline {
            font-size: 16px;
            gap: 8px;
          }
          .website {
            font-size: 16px;
          }
          .logo-wrapper {
            gap: 12px;
          }
        }

        @media (max-width: 550px) {
          .main-text {
            font-size: 32px;
          }
          .logo-icon {
            width: 65px;
            height: 65px;
          }
          .logo-icon svg {
            width: 65px;
            height: 65px;
          }
          .tagline {
            font-size: 12px;
            gap: 6px;
          }
          .website {
            font-size: 11px;
          }
        }
      `}</style>

      <div className={`splash-container ${isFadingOut ? 'fade-out' : ''}`}>
        <div className="bg-particles" ref={bgParticlesRef}></div>
        <div className="glow-orb" ref={glowOrbRef}></div>

        <div className="container">
          <div className="logo-wrapper">
            {/* Circular Logo Icon */}
            <div className="logo-icon" ref={logoIconRef}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
                  </filter>
                </defs>

                <circle cx="70" cy="70" r="60" fill="#1E3A4C" filter="url(#shadow)" id="mainCircle" ref={mainCircleRef} opacity="0" />

                <path id="greenArc"
                  d="M 70 10 A 60 60 0 0 0 10 70 A 60 60 0 0 0 45 120 L 50 100 A 40 40 0 0 1 30 70 A 40 40 0 0 1 70 30 Z"
                  fill="#00A859" opacity="0" ref={greenArcRef} />

                <path id="sShape"
                  d="M 85 45 Q 95 40 105 45 Q 110 50 105 60 L 85 75 Q 80 80 75 85 Q 70 90 65 95 Q 55 100 45 95 Q 35 90 40 80 Q 45 75 55 75 L 75 60 Q 80 55 85 50 Q 90 45 85 45 Z M 55 50 Q 50 45 45 50 Q 40 55 45 60 Q 50 65 60 65 L 70 60 Q 65 55 60 55 Q 55 55 55 50 Z"
                  fill="white" opacity="0" />

                <g id="sLetter" opacity="0" ref={sLetterRef}>
                  <text x="70" y="95" fontSize="70" fontWeight="900"
                    fill="white" textAnchor="middle"
                    style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>S</text>
                </g>

                <path id="chatTail"
                  d="M 30 110 L 15 130 L 40 115 Z"
                  fill="#1E3A4C" opacity="0" ref={chatTailRef} />
              </svg>

              <div className="energy-ring" ref={ring1Ref}></div>
              <div className="energy-ring" ref={ring2Ref}></div>
              <div className="energy-ring" ref={ring3Ref}></div>
            </div>

            {/* Logo Text */}
            <div className="logo-text-wrapper" ref={logoTextWrapperRef}>
              <div className="main-text">
                <span className="letter">S</span>
                <span className="letter">t</span>
                <span className="letter">e</span>
                <span className="letter">p</span>
                <span className="letter">o</span>
                <span className="letter">n</span>
                <span className="letter">e</span>
                <span className="letter" style={{ color: '#00A859' }}>X</span>
                <span className="letter" style={{ color: '#00A859' }}>T</span>
              </div>

              <div className="tagline" ref={taglineRef}>
                <span className="tagline-word">Chat</span>
                <div className="dot-separator"></div>
                <span className="tagline-word">Shop</span>
                <div className="dot-separator"></div>
                <span className="tagline-word">Simple</span>
              </div>

              <div className="website" ref={websiteRef}>whatscom.steponextai.tech</div>

              <div className="shimmer" ref={shimmerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}