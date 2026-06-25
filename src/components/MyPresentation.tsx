import React, { useEffect, useRef, useState } from "react";
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
    | { type: "nameAndDefinitionList", title: string, items: [string, string][] }
    | { type: "highlightBlocks", title: string, blocks: { title: string, text: string }[] }

const TextSlide = ({ slide, isActive }: any) => {
    return (
        <div
            className={`
                absolute inset-0 flex items-center justify-center text-center overflow-y-auto
                px-6 sm:px-6 md:px-15 rounded-2xl
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={slide} isActive={isActive} className="text-lg sm:text-xl md:text-2xl lg:text-3xl" />
        </div>
    )
}

const TwoColsSlide = ({ left, right, isActive }: any) => (
    <div
        className={`
            absolute inset-0 flex flex-col sm:grid sm:grid-cols-2
            gap-4 sm:gap-8 min-w-0 items-center justify-center text-center 
            px-6 sm:px-10 md:px-15 rounded-2xl
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
                absolute inset-0 flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-6 md:gap-8 min-w-0 items-center justify-center text-center
                px-6 sm:px-6 md:px-15 rounded-2xl min-h-2
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={left} isActive={isActive} delay={0} />

            <div className={`flex flex-col gap-4 text-left`}>
                {right.map((item: string, i: number) => {
                    const items = `• ${item}`
                    return (
                        <div key={i} className="flex min-w-0">
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
                absolute inset-0 flex flex-col gap-8 items-center justify-center text-center
                px-2 sm:px-6 md:px-15 rounded-2xl
                transition-all duration-500
                ${isActive
                    ? "opacity-100 scale-100 z-10 pointer-events-auto"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <AnimatedText text={title} isActive={isActive} delay={0} />
            <div
                className="
                grid gap-3 sm:gap-4 w-full
                grid-cols-1
                sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]
                "
                style={{
                    "--cols": cols,
                } as React.CSSProperties}
            >
                {columns.map((col: string, i: number) => (
                    <div
                        key={i}
                        className="flex items-center justify-center bg-white/10 p-4 rounded-xl"
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
    const useTwoCols = steps.length > 8;

    return (
        <div
            className={`
                absolute inset-0 flex flex-col gap-4
                items-start sm:items-center justify-center text-center overflow-y-auto
                px-4 sm:px-10 md:px-15 py-4 sm:py-0
                rounded-2xl
                transition-all duration-500 text-white
                overflow-y-auto 

                ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            {/* TITLE */}
            <div className="text-center w-full">
                <AnimatedText text={title} isActive={isActive} />
            </div>

            {/* 📱 MOBILE */}
            <div className="flex flex-col gap-4 w-full sm:hidden">
                {steps.map((step: string, i: number) => {
                    const number = `${i + 1}`;

                    return (
                        <div
                            key={i}
                            className="flex gap-3 bg-white/10 rounded-2xl p-3 w-full"

                        >
                            
                            <div
                                className="
                                    flex items-center justify-center
                                    rounded-full bg-white text-black font-bold
                                    w-7 h-7 text-xs
                                    sm:w-8 sm:h-8 sm:text-sm
                                "
                            >
                                {number}
                            </div>

                            {/* TEXT */}
                            <div className="flex-1">
                                <AnimatedText
                                    text={step}
                                    isActive={isActive}
                                    delay={0.3 + i * 0.3}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 💻 DESKTOP */}
            <div
                className={`
                    hidden sm:flex w-full max-w-4xl
                    ${useTwoCols
                        ? "grid grid-cols-2 gap-6 place-items-center"
                        : "flex flex-col gap-6 items-center"}
                `}
            >
                {steps.map((step: string, i: number) => {
                    const number = `${i + 1}`;

                    return (
                        <div
                            key={i}
                            className="flex gap-4 bg-white/10 rounded-2xl p-2 w-full"
                        >
                            <div
                                className="
                                    min-w-8 h-8 flex items-center justify-center
                                    rounded-full bg-white text-black font-bold text-sm
                                "
                            >
                                {number}
                            </div>

                            <AnimatedText
                                text={step}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className={stepsSize}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GridSlide = ({
    title,
    items,
    isActive,
}: {
    title: string;
    items: string[];
    isActive: boolean;
}) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (isActive) setHasMounted(true);
    }, [isActive]);

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

    const Item = ({ item, i }: { item: string; i: number }) => {

        return (
            <div
                className={`
                bg-white/10 rounded-xl backdrop-blur 
                 flex items-center justify-center opacity-0 w-full h-full
                ${hasMounted ? "animate-fadeIn" : ""}
            `}
                style={{
                    animationDelay: `${0.5 + i * 0.3}s`,
                    animationFillMode: "forwards",
                    padding: `${0.5 * scale}rem`,
                }}
            >
                <div
                    className="
                    text-center text-lg md:text-xl lg:text-2xl
                    break-words
                "
                >
                    {item}
                </div>
            </div>
        )
    }

    return (
        <div
            className={`
                absolute inset-0 flex flex-col gap-4
                px-4 sm:px-10 md:px-15
                rounded-2xl
                transition-all duration-500 text-white

                items-center
                justify-center text-center overflow-y-auto

                ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            <div className="text-center mb-2 w-full">
                <AnimatedText
                    text={title}
                    isActive={isActive}
                    delay={0}
                    className="text-base sm:text-lg md:text-xl lg:text-2xl"
                />
            </div>

            {/* 📱 MOBILE: todo en columna */}
            <div className="flex flex-col gap-3 w-full sm:hidden">
                {items.map((item, i) => (
                    <Item key={item} item={item} i={i} />
                ))}
            </div>


            <div className="hidden sm:block w-full">
                <div
                    className="grid w-full gap-4 sm:gap-6 mb-6"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    }}
                >
                    {firstItems.map((item, i) => (
                        <div
                            key={i}
                            style={{ height: `${rowHeight}vh` }}>
                            <Item item={item} i={i} />
                        </div>
                    ))}
                </div>

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
                                    height: "100%",
                                }}
                            >
                                <Item item={item} i={i + firstItems.length} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const NameAndDefinitionListSlide = ({
    title,
    items,
    isActive
}: any) => {

    const useTwoCols = items.length > 8;

    return (
        <div
            className={`
                absolute inset-0 flex flex-col gap-4
                items-center 
                px-4 sm:px-10 md:px-15 py-4 sm:py-0
                rounded-2xl
                transition-all duration-500 text-white
                justify-center text-center overflow-y-auto

                ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            {/* TITLE */}
            <div className="text-center w-full">
                <AnimatedText text={title} isActive={isActive} />
            </div>

            {/* MOBILE */}
            <div className="flex flex-col gap-4 w-full sm:hidden">
                {items.map((item: [string, string], i: number) => {
                    const [name, definition] = item;

                    return (
                        <div
                            key={i}
                            className="bg-white/10 rounded-xl p-4"
                        >
                            <div className="mb-2">
                                <AnimatedText
                                    text={name}
                                    isActive={isActive}
                                    delay={0.3 + i * 0.3}
                                    className="text-base font-bold"
                                />
                            </div>

                            <AnimatedText
                                text={definition}
                                isActive={isActive}
                                delay={0.3 + i * 0.3}
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    );
                })}
            </div>

            {/* DESKTOP */}
            <div
                className={`
                    hidden sm:grid w-full max-w-5xl gap-8
                    ${useTwoCols
                        ? "grid-cols-2"
                        : "grid-cols-1"}
                `}
            >
                {items.map((item: [string, string], i: number) => {
                    const [name, definition] = item;

                    return (
                        <div
                            key={i}
                            className="w-full grid grid-cols-[180px_1fr] gap-6 bg-white/10 p-4 rounded-xl"
                        >
                            <AnimatedText
                                text={name}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className={`font-bold text-lg`}
                            />

                            <AnimatedText
                                text={definition}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className={getTextSize(definition)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const HighlightBlocksSlide = ({
    title,
    blocks = [],
    isActive
}: any) => {

    const cols = 2;

    const remainder = blocks.length % cols;
    const lastRowCount = remainder === 0 ? cols : remainder;

    const firstBlocks = blocks.slice(0, blocks.length - lastRowCount);
    const lastBlocks = blocks.slice(blocks.length - lastRowCount);

    return (
        <div
            className={`
                absolute inset-0 flex flex-col items-center
                px-4 sm:px-10 md:px-16
                py-4 sm:py-0
                transition-all duration-500
                justify-center text-center overflow-y-auto

                ${isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95 z-0 pointer-events-none"}
            `}
        >
            {/* TITLE */}
            <div className="flex items-center justify-center w-full max-w-6xl mb-4 text-center">
                <AnimatedText
                    text={title}
                    isActive={isActive}
                />
            </div>

            <div className="flex flex-col gap-4 w-full sm:hidden">
                {blocks.map((block: any, i: number) => (
                    <div
                        key={block.id || i}
                        className="bg-white/10 rounded-3xl p-4 sm:p-5 backdrop-blur-sm"
                    >
                        <AnimatedText
                            text={block.title}
                            isActive={isActive}
                            delay={0.6 + i * 0.3}
                            className="text-base font-bold mb-2 text-white"
                        />

                        <AnimatedText
                            text={block.text}
                            isActive={isActive}
                            delay={0.6 + i * 0.3}
                            className="text-sm sm:text-base leading-relaxed"
                        />
                    </div>
                ))}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block w-full max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    {firstBlocks.map((block: any, i: number) => (
                        <div
                            key={block.id || i}
                            className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm"
                        >
                            <AnimatedText
                                text={block.title}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className="text-xl font-bold mb-4 text-white"
                            />

                            <AnimatedText
                                text={block.text}
                                isActive={isActive}
                                delay={0.6 + i * 0.6}
                                className="text-lg leading-relaxed"
                            />
                        </div>
                    ))}
                </div>

                {/* última fila centrada (SE MANTIENE TU LOGICA) */}
                {lastBlocks.length > 0 && (
                    <div className="flex justify-center gap-6 w-full mt-6">
                        {lastBlocks.map((block: any, i: number) => (
                            <div
                                key={block.id || i}
                                className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm w-[calc(50%-12px)]"
                            >
                                <AnimatedText
                                    text={block.title}
                                    isActive={isActive}
                                    delay={0.6 + (i + firstBlocks.length) * 0.6}
                                    className="text-xl font-bold mb-4 text-white"
                                />

                                <AnimatedText
                                    text={block.text}
                                    isActive={isActive}
                                    delay={0.6 + (i + firstBlocks.length) * 0.6}
                                    className="text-lg leading-relaxed"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
    if (count <= 3) return "text-base sm:text-lg md:text-xl lg:text-2xl";
    if (count <= 5) return "text-sm sm:text-base md:text-lg lg:text-xl";
    if (count <= 8) return "text-xs sm:text-sm md:text-base lg:text-lg";
    if (count <= 12) return "text-[11px] sm:text-xs md:text-sm lg:text-base";
    return "text-[10px] sm:text-xs md:text-sm lg:text-base";
};

const getTextSize = (text: string) => {
    const length = text.length;

    if (length < 60)
        return "text-base sm:text-lg md:text-xl lg:text-2xl";

    if (length < 120)
        return "text-sm sm:text-base md:text-lg lg:text-xl";

    if (length < 200)
        return "text-xs sm:text-sm md:text-base lg:text-lg";

    if (length < 320)
        return "text-[11px] sm:text-xs md:text-sm lg:text-base";

    return "text-[10px] sm:text-xs md:text-sm lg:text-base";
};


const AnimatedText = ({ text, isActive, className = "", delay = 0, textColor = "text-white" }: { text: string, isActive: boolean, className?: string, delay?: number, style?: React.CSSProperties, textColor?: string }) => {
    const lines = text.split(
        /(?<!\b(?:D\.S|Sr|Sra|Dr|Ing|Lic|D.S.))(?<=[.!?])[\s\n]+/
    );

    return (
        <div className="flex flex-col gap-4">
            {lines.map((line, i) => {
                const lineSize = className || getTextSize(line);
                return (
                    <p
                        key={`${isActive}-${i}`}
                        className={`
                        ${textColor} leading-relaxed opacity-0
                        break-words whitespace-normal
                        ${lineSize}
                        ${isActive ? "animate-fadeIn" : ""}
                    `}
                        style={{
                            animationDelay: `${delay + i * 0.4}s`,
                            animationFillMode: "forwards",
                        }}
                    >
                        {line}
                    </p>
                )
            })}
        </div>
    );
};


export function MyPresentation({ slides }: PresentationProps) {

    const isSwipingRef = useRef(false);
    const startXRef = useRef<number | null>(null);

    const minSwipeDistance = 60;

    const [current, setCurrent] = useState(0)

    const next = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prev = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const onTouchStart = (e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        isSwipingRef.current = false;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        isSwipingRef.current = true;
        e.preventDefault();
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!isSwipingRef.current) return;

        const startX = startXRef.current;
        if (startX === null) return;

        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) < minSwipeDistance) return;

        if (diff < 0) next();
        else prev();

        startXRef.current = null;
    };

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
            <div
                className="relative min-h-[83vh] sm:min-h-[70vh] w-full overflow-hidden overscroll-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    touchAction: "pan-y",
                    overscrollBehavior: "none"
                }}
            >
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
                                    key={`${slide.type}-${i}`}
                                    title={slide.title}
                                    items={slide.items}
                                    isActive={isActive}
                                />
                            );

                        case "nameAndDefinitionList":
                            return (
                                <NameAndDefinitionListSlide
                                    key={i}
                                    title={slide.title}
                                    items={slide.items}
                                    isActive={isActive}
                                />
                            )

                        case "highlightBlocks":
                            return (
                                <HighlightBlocksSlide
                                    key={i}
                                    title={slide.title}
                                    blocks={slide.blocks}
                                    isActive={isActive}

                                />
                            )

                        default:
                            return null;
                    }
                })}

                <button
                    onClick={prev}
                    className="
        absolute left-1 sm:left-2
        top-1/2 -translate-y-1/2
        z-20 text-white
        p-2 sm:p-3 opacity-70
        rounded-full hover:opacity-100
        scale-95 hover:scale-110 transition
    "
                >
                    <FaAngleLeft className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </button>

                <button
                    onClick={next}
                    className="
        absolute right-1 sm:right-2
        top-1/2 -translate-y-1/2
        z-20 text-white
        p-2 sm:p-3 opacity-70
        rounded-full hover:opacity-100
        scale-95 hover:scale-110 transition
    "
                >
                    <FaAngleRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
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