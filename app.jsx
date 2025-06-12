import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

// ---- ScrollReveal ----
function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = false,
  baseRotation = 0,
  blurStrength = 10,
}) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = {
    opacity: visible ? 1 : baseOpacity,
    transform: visible ? "none" : `rotate(${baseRotation}deg)`,
    filter: enableBlur ? `blur(${visible ? 0 : blurStrength}px)` : "none",
    transition: "all 0.8s cubic-bezier(.22,.68,.4,1.01)",
    willChange: "opacity, transform, filter",
  };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

// ---- SplitText ----
function SplitText({
  text,
  className,
  delay = 100,
  duration = 0.6,
  ease = "easeOut",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  splitType = "chars",
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold, rootMargin }
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const split = (txt) =>
    splitType === "chars"
      ? txt.split("")
      : splitType === "words"
      ? txt.split(" ")
      : [txt];

  const chars = split(text);

  // On complete of last letter
  const handleComplete = (i) => {
    if (i === chars.length - 1 && onLetterAnimationComplete) {
      onLetterAnimationComplete();
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: "flex", justifyContent: textAlign }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={from}
          animate={visible ? to : from}
          transition={{
            delay: delay * i / 1000,
            duration,
            ease
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          onAnimationComplete={() => handleComplete(i)}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

// ---- ProfileCard ----
function ProfileCard({
  name,
  title,
  handle,
  status,
  contactText,
  avatarUrl,
  showUserInfo = true,
  enableTilt = false,
  onContactClick
}) {
  const CardContent = (
    <div
      className="profile-card"
      style={{
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(255,51,51,0.10), 0 1.5px 8px #ff333322",
        background: "rgba(18,18,20,0.75)",
        padding: "32px 24px",
        maxWidth: 340,
        margin: "auto",
        color: "#fff",
        textAlign: "center",
        position: "relative"
      }}
    >
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 18,
          border: "3px solid #ff3333"
        }}
      />
      {showUserInfo && (
        <>
          <div style={{ fontSize: "1.3em", fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: "1.05em", color: "#ff3333", fontWeight: 500 }}>{title}</div>
          <div style={{ color: "#aaa", fontSize: "0.98em", margin: "6px 0" }}>@{handle}</div>
          <div
            style={{
              color: status === "Online" ? "#3fae3f" : "#d53f3f",
              fontWeight: 500,
              fontSize: "0.96em",
              marginBottom: 10
            }}
          >
            ● {status}
          </div>
        </>
      )}
      <button
        style={{
          background: "#ff3333",
          color: "#fff",
          border: "none",
          borderRadius: "13px",
          padding: "10px 22px",
          fontWeight: 600,
          fontSize: "1.08em",
          cursor: "pointer",
          marginTop: 12,
          transition: "background 0.18s, color 0.18s",
          boxShadow: "0 2px 8px #ff333322"
        }}
        onClick={onContactClick}
      >
        {contactText}
      </button>
    </div>
  );

  if (enableTilt) {
    return (
      <Tilt glareEnable glareMaxOpacity={0.15} glareColor="#ff3333" glareBorderRadius="20px" tiltMaxAngleX={12} tiltMaxAngleY={12}>
        {CardContent}
      </Tilt>
    );
  }
  return CardContent;
}

// ---- AnimatedList ----
function AnimatedList({
  items,
  onItemSelect,
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = false,
}) {
  const [focused, setFocused] = useState(0);
  const listRef = useRef();

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handler = (e) => {
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setFocused((prev) => {
          if (e.key === "ArrowDown") return Math.min(prev + 1, items.length - 1);
          if (e.key === "ArrowUp") return Math.max(prev - 1, 0);
          return prev;
        });
      }
      if (e.key === "Enter" && onItemSelect) {
        onItemSelect(items[focused], focused);
      }
    };
    const node = listRef.current;
    node && node.addEventListener('keydown', handler);
    return () => node && node.removeEventListener('keydown', handler);
  }, [enableArrowNavigation, focused, items, onItemSelect]);

  return (
    <div
      ref={listRef}
      tabIndex={0}
      style={{
        outline: 'none',
        overflowY: displayScrollbar ? 'auto' : 'hidden',
        maxHeight: 320,
        position: 'relative',
        background: '#181818',
        borderRadius: 16,
        boxShadow: '0 2px 12px #ff333330',
        padding: 0,
        margin: '0 auto',
        width: 320,
        scrollbarWidth: displayScrollbar ? 'thin' : 'none'
      }}
    >
      {showGradients && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 28,
            background: 'linear-gradient(to bottom, #181818 80%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
            background: 'linear-gradient(to top, #181818 80%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none'
          }} />
        </>
      )}
      <ul style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}>
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.06 * i, duration: 0.36, type: "spring" }}
            tabIndex={-1}
            onClick={() => onItemSelect && onItemSelect(item, i)}
            style={{
              padding: "14px 20px",
              borderBottom: i < items.length - 1 ? "1px solid #232323" : "none",
              cursor: "pointer",
              background: focused === i ? "#ff333315" : "transparent",
              color: "#fff",
              transition: "background 0.1s",
              outline: focused === i ? "2px solid #ff3333" : "none"
            }}
            onMouseEnter={() => setFocused(i)}
            onFocus={() => setFocused(i)}
            aria-selected={focused === i}
            role="option"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ---- The main App ----
export default function App() {
  const items = [
    "Item 1", "Item 2", "Item 3", "Item 4", "Item 5",
    "Item 6", "Item 7", "Item 8", "Item 9", "Item 10"
  ];

  return (
    <div style={{background: "#0c0c0e", minHeight: "100vh", padding: 0, margin: 0, fontFamily: "Inter, Arial, sans-serif"}}>
      {/* Glyph SVG background for Nothing style */}
      <svg className="glyph-bg" viewBox="0 0 800 800"
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 0, pointerEvents: "none", opacity: 0.18
        }}>
        <circle cx="400" cy="400" r="340" stroke="white" strokeWidth="3.5" fill="none" opacity="0.13" />
        <circle cx="400" cy="400" r="250" stroke="white" strokeWidth="3.5" fill="none" opacity="0.09" />
        <circle cx="400" cy="400" r="160" stroke="white" strokeWidth="2.5" fill="none" opacity="0.07" />
        <rect x="200" y="200" width="400" height="400" rx="120" stroke="white" strokeWidth="3" fill="none" opacity="0.06"/>
        <line x1="400" y1="60" x2="400" y2="740" stroke="white" strokeWidth="2" opacity="0.08"/>
        <line x1="60" y1="400" x2="740" y2="400" stroke="white" strokeWidth="2" opacity="0.08"/>
      </svg>

      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 500,
        margin: "60px auto 0",
        background: "rgba(26,26,29,0.80)",
        borderRadius: "24px",
        boxShadow: "0 8px 32px 0 rgba(255,51,51,0.10), 0 1.5px 8px 0 #ff333322",
        padding: "36px 22px 26px 22px",
        border: "1.7px solid #242426",
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        backdropFilter: "blur(24px) saturate(1.11)",
        WebkitBackdropFilter: "blur(24px) saturate(1.11)"
      }}>
        <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
          <div style={{fontStyle: "italic", marginBottom: 24}}>
            When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! 
            When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!
          </div>
        </ScrollReveal>

        <SplitText
          text="Essential Space, Nothing-Style"
          className="text-2xl font-semibold text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={() => {}}
        />

        <div style={{margin: "24px auto"}}>
          <ProfileCard
            name="Javi A. Torres"
            title="Software Engineer"
            handle="javicodes"
            status="Online"
            contactText="Contact Me"
            avatarUrl="icon-192.png"
            showUserInfo={true}
            enableTilt={true}
            onContactClick={() => alert("Contact clicked")}
          />
        </div>

        <div style={{margin: "24px auto"}}>
          <AnimatedList
            items={items}
            onItemSelect={(item, idx) => alert(`${item} (${idx}) selected`)}
            showGradients
            enableArrowNavigation
            displayScrollbar
          />
        </div>
      </div>
    </div>
  );
}