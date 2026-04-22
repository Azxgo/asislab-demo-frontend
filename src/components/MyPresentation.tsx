import { useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

interface PresentationProps {
    slides: Slide[];
}
type Slide =
    | { type: "text"; content: string }
    | { type: "2Cols", left: string, right: string }
    | { type: "definitionAndExamples"; left: string, right: string[] }
    | { type: "titleAndColumns"; title: string, columns: string[] }
    | { type: "steps"; title: string; steps: string[] }
    | { type: "grid"; title: string; items: string[] }

const TextSlide = ({ slide, isActive }: any) => {
    return (
        <div
            className={`
                absolute inset-0 flex items-center justify-center text-center px-15 rounded-2xl
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={slide} isActive={isActive} className="text-2xl" />
        </div>
    )
}

const TwoColsSlide = ({ left, right, isActive }: any) => (
    <div
        className={`
        absolute inset-0 grid grid-cols-2 gap-8 min-w-0 items-center justify-center text-center px-15 rounded-2xl
        transition-all duration-500 text-white
        ${isActive
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0 pointer-events-none"}
    `}
    >
        <AnimatedText text={left} isActive={isActive} />
        <AnimatedText text={right} isActive={isActive} />
    </div>
);

const DefinitionExamplesSlide = ({ left, right, isActive }: any) => {
    const listSize = getListSize(right.length);

    return (
        <div
            className={`
                absolute inset-0 grid grid-cols-2 gap-8 min-w-0 items-center justify-center text-center px-15 rounded-2xl
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={left} isActive={isActive} delay={0} />

            <div className={`flex flex-col gap-4 text-left ${listSize}`}>
                {right.map((item: string, i: number) => {
                    const items = `• ${item}`
                    return (
                        <div key={i} className="flex gap-2 min-w-0">
                            <AnimatedText
                                text={items}
                                isActive={isActive}
                                className={listSize}
                                delay={0.6 + i * 0.6}
                            />
                        </div>)
                })}
            </div>
        </div>
    )
}

const TitleAndColumns = ({ title, columns, isActive }: any) => {
    const cols = Math.min(Math.max(columns.length, 1), 5)

    return (
        <div
            className={`
                absolute inset-0 flex flex-col gap-8 items-center justify-center text-center px-15 rounded-2xl
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={title} isActive={isActive} delay={0} />
            <div
                className="grid gap-4 w-full"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                }}
            >
                {columns.map((col: string, i: number) => (
                    <div
                        key={i}
                        className="bg-white/10 p-4 rounded-xl"
                        style={{
                            animationDelay: `${0.5 + i * 0.5}s`,
                            animationFillMode: "forwards"
                        }}
                    >
                        <AnimatedText
                            text={col}
                            isActive={isActive}
                            delay={0.6 + i * 0.6}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

const StepsSlide = ({ title, steps, isActive }: any) => {
    const stepsSize = getStepsSize(steps.length);
    const useTwoCols = steps.length > 8

    return (
        <div
            className={`
        absolute inset-0 flex flex-col gap-4 items-center justify-center px-15 rounded-2xl
        transition-all duration-500 text-white
        ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
    `}
        >
            <div className="text-center">
                <AnimatedText text={title} isActive={isActive} />
            </div>

            <div className={`
                w-full max-w-4xl
                ${useTwoCols ? "grid grid-cols-2 gap-6 place-items-center" : "flex flex-col gap-6 items-center"}
                `}>
                {steps.map((step: string, i: number) => {
                    const cleanStep = step.replace(/^\s*\d+[\.\-\)]\s*/, "")
                    const finalStep = `${i + 1} - ${cleanStep}`
                    return (
                        <div key={i} className="flex gap-4">
                            <AnimatedText
                                text={finalStep}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className={stepsSize}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const GridSlide = ({
    title,
    items,
    isActive,
}: {
    title: string;
    items: string[];
    isActive: boolean;
}) => {

    const getGridCols = (count: number) => {
        if (count <= 1) return 1;
        if (count <= 4) return 2;
        if (count <= 9) return 3;
        return 4;
    };

    const cols = getGridCols(items.length);

    const getScaleFactor = (count: number) => {
        return Math.max(0.5, 1 - (count - 1) * 0.03);
    };

    const scale = getScaleFactor(items.length);

    const rows = Math.ceil(items.length / cols);
    const rowHeight = 40 / rows;

    const remainder = items.length % cols;
    const lastRowCount = remainder === 0 ? cols : remainder;

    const firstItems = items.slice(0, items.length - lastRowCount);
    const lastItems = items.slice(items.length - lastRowCount);

    const Item = ({ item, i }: { item: string; i: number }) => (
        <div
            className={`
                bg-white/10 rounded-xl backdrop-blur 
                flex items-center justify-center opacity-0 w-full h-full
                ${isActive ? "animate-fadeIn" : ""}
            `}
            style={{
                animationDelay: `${0.5 + i * 0.3}s`,
                animationFillMode: "forwards",
                padding: `${0.5 * scale}rem`,
                height: "100%"
            }}
        >
            <AnimatedText
                text={item}
                isActive={isActive}
                delay={0.5 + i * 0.3}
                className="text-center text-lg md:text-xl lg:text-2xl"
            />
        </div>
    );

    return (
        <div
            className={`
                absolute inset-0 flex flex-col gap-4 items-center justify-center 
                px-6 sm:px-10 md:px-15 rounded-2xl
                transition-all duration-500 text-white
                ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            {/* Título */}
            <div className="text-center mb-2">
                <AnimatedText text={title} isActive={isActive} delay={0} />
            </div>

            {/* Grid */}
            <div
                className="grid w-full gap-4 sm:gap-6"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
            >
                {firstItems.map((item, i) => (
                    <div key={i} style={{ height: `${rowHeight}vh` }}>
                        <Item item={item} i={i} />
                    </div>
                ))}
            </div>

            {/* 🔥 Última fila centrada con MISMA altura */}
            {lastItems.length > 0 && (
                <div
                    className="flex justify-center gap-4 sm:gap-6 w-full"
                    style={{ height: `${rowHeight}vh` }}
                >
                    {lastItems.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                width: `${100 / cols}%`,
                                height: "100%"
                            }}
                        >
                            <Item item={item} i={i + firstItems.length} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getStepsSize = (count: number) => {
    if (count <= 4) return "text-lg sm:text-xl md:text-2xl";
    if (count <= 6) return "text-base sm:text-lg md:text-xl";
    if (count <= 8) return "text-sm sm:text-base md:text-lg";
    return "text-xs sm:text-sm md:text-base";
}

const getListSize = (count: number) => {
    if (count <= 3) return "text-lg sm:text-xl md:text-2xl";
    if (count <= 5) return "text-base sm:text-lg md:text-xl";
    if (count <= 8) return "text-sm sm:text-base md:text-lg";
    if (count <= 12) return "text-xs sm:text-sm md:text-base";
    return "text-[10px] sm:text-xs";
};

const getTextSize = (text: string) => {
    const length = text.length


    if (length < 80)
        return "text-lg sm:text-xl md:text-2xl"

    if (length < 150)
        return "text-base sm:text-lg md:text-xl"

    if (length < 250)
        return "text-sm sm:text-base md:text-lg"

    if (length < 400)
        return "text-xs sm:text-sm md:text-base"

    return "text-[10px] sm:text-xs md:text-sm"
}

const AnimatedText = ({ text, isActive, className = "", delay = 0, style }: { text: string, isActive: boolean, className?: string, delay?: number, style?: React.CSSProperties; }) => {
    const lines = text.split(/(?<=[.!?])[\s\n]+/);
    const textSize = className || getTextSize(text);

    return (
        <div className="flex flex-col gap-4">
            {lines.map((line, i) => (
                <p
                    key={`${isActive}-${i}`}
                    className={`
                        text-white leading-relaxed opacity-0
                        break-words whitespace-normal
                        ${textSize}
                        ${isActive ? "animate-fadeIn" : ""}
                    `}
                    style={{
                        animationDelay: `${delay + i * 0.4}s`,
                        animationFillMode: "forwards",
                    }}
                >
                    {line}
                </p>
            ))}
        </div>
    );
};


export function MyPresentation({ slides }: PresentationProps) {

    const [current, setCurrent] = useState(0)

    const next = () => {
        setCurrent((prev) => (prev + 1) % slides.length)
    }

    const prev = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);


    return (
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400
            dark:from-blue-800 dark:via-blue-700 dark:to-blue-600
            rounded-xl shadow-md w-full max-w-7xl mx-auto p-4 m-4"
        >
            <div className="relative h-[65vh] w-full  overflow-hidden">
                {slides.map((slide, i) => {
                    const isActive = i === current;

                    switch (slide.type) {
                        case "text":
                            return (
                                <TextSlide
                                    key={i}
                                    slide={slide.content}
                                    isActive={isActive}
                                />
                            );

                        case "2Cols":
                            return (
                                <TwoColsSlide
                                    key={i}
                                    left={slide.left}
                                    right={slide.right}
                                    isActive={isActive}
                                />
                            )

                        case "definitionAndExamples":
                            return (
                                <DefinitionExamplesSlide
                                    key={i}
                                    left={slide.left}
                                    right={slide.right}
                                    isActive={isActive}
                                />
                            );

                        case "titleAndColumns":
                            return (
                                <TitleAndColumns
                                    key={i}
                                    title={slide.title}
                                    columns={slide.columns}
                                    isActive={isActive}
                                />
                            );

                        case "steps":
                            return (
                                <StepsSlide
                                    key={i}
                                    title={slide.title}
                                    steps={slide.steps}
                                    isActive={isActive}
                                />
                            );

                        case "grid":
                            return (
                                <GridSlide
                                    key={i}
                                    title={slide.title}
                                    items={slide.items}
                                    isActive={isActive}
                                />
                            );

                        default:
                            return null;
                    }
                })}

                <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white px-2 py-2 rounded-full scale-95 hover:scale-110 transition"
                >
                    <FaAngleLeft size={40} />
                </button>

                <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white px-2 py-2 rounded-full scale-95 hover:scale-110 transition"
                >
                    <FaAngleRight size={40} />
                </button>
            </div>

            <div className="flex justify-center mt-4 gap-2">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition
                            ${i === current ? "bg-white scale-125" : "bg-white/40"}
                            `}
                    />
                ))}
            </div>
            <style>{`
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
                    animation: fadeIn 0.6s ease;
                }
                `}</style>
        </div>
    )
}