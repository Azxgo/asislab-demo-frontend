import React from "react";
import { Swiper, SwiperSlide, useSwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade, Keyboard, } from "swiper/modules";

import "swiper/swiper-bundle.css";

interface PresentationProps {
  talk: string;
}

const splitIntoSlides = (text: string, maxWords: number) => {
  const blocks = text.split(/\n\s*\n/);
  const slides: string[] = [];

  for (const block of blocks) {
    const sentences = block.split(/(?<=[.!?])[\s\n]+/);

    let currentSlide = "";
    let wordCount = 0;

    const pushSlide = () => {
      if (currentSlide.trim()) {
        slides.push(currentSlide.trim());
        currentSlide = "";
        wordCount = 0;
      }
    };

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).length;

      if (wordCount + sentenceWords <= maxWords) {
        currentSlide += sentence;
        wordCount += sentenceWords;
        continue;
      }

      const partsByColon = sentence.match(/[^:]+:?\s*/g) || [];

      for (const part of partsByColon) {
        const partWords = part.trim().split(/\s+/).length;

        if (wordCount + partWords <= maxWords) {
          currentSlide += part;
          wordCount += partWords;
          continue;
        }

        const partsByComma = part.match(/[^,]+,?\s*/g) || [];

        for (const subPart of partsByComma) {
          const words = subPart.trim().split(/\s+/).length;

          if (wordCount + words > maxWords) {
            pushSlide();
          }

          currentSlide += subPart;
          wordCount += words;
        }
      }
    }

    pushSlide();
  }

  return slides;
};

const highlightText = (text: string) => {
  return text
    .replace(
      /(\d+(\.\d+)?%|\bprevenci[oó]n\b)/gi,
      "<span class='text-yellow-200 font-bold'>$1</span>"
    )
    .replace(
      /(OSHA|NFPA|ANSI|NOM|ISO)/g,
      "<span class='text-green-300 font-bold'>$1</span>"
    )
    .replace(
      /\b(muerte|peligros?|riesgos?|explosión)\b/gi,
      "<span class='text-red-400 font-bold'>$1</span>"
    )
}

const getSlideStyle = (text: string) => {
  const firstLine = text.split(/(?<=[.!?])[\s\n]+/)[0] || "";

  // 🔴 peligro
  if (/\b(muerte|explosión|riesgo)\b/i.test(text)) {
    return "bg-red-700/30 border border-red-400";
  }

  // 🔵 definición
  if (/\b(definición|qué es|se define)\b/i.test(text)) {
    return "bg-blue-700/30 border border-blue-400";
  }

  // 🟡 IDEA PRINCIPAL
  if (
    // tiene estructura tipo título
    /:/.test(firstLine) ||

    // empieza con concepto fuerte
    /^\s*(el|la|los|las)\s+\w+/i.test(firstLine) ||

    // contiene verbos explicativos clave
    /\b(se define|consiste en|es|se basa en)\b/i.test(firstLine)
  ) {
    return "bg-yellow-500/20 border border-yellow-300";
  }

  return "bg-white/5";
};

const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
  const { isActive } = useSwiperSlide();

  const lines = text.split(/(?<=[.!?])[\s\n]+/);

  return (
    <div className="flex flex-col gap-4">
      {lines.map((line, i) => (
        <p
          key={`${isActive}-${i}`}
          className="opacity-0 animate-fadeIn text-white text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed"
          style={{
            animationDelay: `${i * 0.6}s`,
            animationFillMode: "forwards",
          }}
          dangerouslySetInnerHTML={{
            __html: highlightText(line),
          }}
        >
        </p>
      ))}
    </div>
  )
}

export const Presentation: React.FC<PresentationProps> = ({ talk = "inicia" }) => {
  const slides = splitIntoSlides(talk, 60);

  return (
    <div className="bg-gradient-to-r 
    from-blue-600 via-blue-500 to-blue-400
    dark:from-blue-800 dark:via-blue-700 dark:to-blue-600
     rounded-xl shadow-md w-full max-w-7xl mx-auto p-4 m-4">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade, Keyboard]}
        spaceBetween={30}
        fadeEffect={{ crossFade: true }}
        keyboard={{ enabled: true }}
        navigation
        pagination={{ clickable: true }}
        autoHeight={true}

      >
        {slides.map((slideText, index) => (
          <SwiperSlide key={index}>
            <div
              className={`
                flex items-center justify-center
                h-[65vh] text-center px-6 rounded-2xl
                transition-all duration-500
                ${getSlideStyle(slideText)}
              `}
            >
              <AnimatedText text={slideText} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-slide {
          opacity: 0.4;
          transform: scale(0.9);
          transition: all 0.4s ease;
        }

        .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
};