import React, { useState, useRef, useCallback, useEffect } from 'react';

const BeforeAfterImageSlider = ({ beforeImageUrl, afterImageUrl, aspectRatio = "4/3" }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const containerRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newX = e.clientX - rect.left;
        newX = Math.max(0, Math.min(newX, rect.width));
        setSliderPos((newX / rect.width) * 100);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || !containerRef.current || !e.touches?.[0]) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newX = e.touches[0].clientX - rect.left;
        newX = Math.max(0, Math.min(newX, rect.width));
        setSliderPos((newX / rect.width) * 100);
    }, [isDragging]);

    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent scroll on touch
        setIsDragging(true);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleImageLoad = () => {
        setImagesLoaded(prev => prev + 1);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    return (
        <div className="w-full px-2 sm:px-0 max-w-2xl mx-auto">
            {/* Container with responsive sizing */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden select-none bg-gray-100 rounded-lg shadow-lg"
                style={{
                    aspectRatio: aspectRatio,
                    maxHeight: '60vh', // Allow more vertical space on mobile
                    minHeight: '200px', // Prevent collapse on very small screens
                }}
            >
                {/* Loading state */}
                {imagesLoaded < 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-0">
                        <div className="text-gray-500 text-sm">Loading images...</div>
                    </div>
                )}

                {/* Before Image */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={beforeImageUrl}
                        alt="Before Treatment"
                        className="w-full h-full object-cover"
                        draggable="false"
                        onLoad={handleImageLoad}
                        style={{ display: imagesLoaded < 2 ? 'none' : 'block' }}
                    />
                </div>

                {/* After Image - Clipped */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        clipPath: `inset(0 0 0 ${sliderPos}%)`,
                        display: imagesLoaded < 2 ? 'none' : 'block',
                    }}
                >
                    <img
                        src={afterImageUrl}
                        alt="After Treatment"
                        className="w-full h-full object-cover"
                        draggable="false"
                        onLoad={handleImageLoad}
                    />
                </div>

                {/* Slider Handle — Optimized for mobile */}
                <div
                    className="absolute inset-y-0 cursor-ew-resize flex items-center justify-center z-10"
                    style={{
                        left: `${sliderPos}%`,
                        transform: 'translateX(-50%)',
                        width: '4px', // Invisible touch target width
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* Visible Handle */}
                    <div className="flex flex-col items-center">
                        {/* Arrow */}
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 shadow-md dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400">
                            <span className="text-xs sm:text-sm">↔</span>
                        </div>
                        {/* Vertical Line */}
                        <div className="w-0.5 h-8 sm:h-12 bg-blue-500 mt-1 dark:bg-blue-400" />
                    </div>
                </div>
            </div>

            {/* Position Indicator — Compact on mobile */}
            <div className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">
                Slide to compare • {Math.round(sliderPos)}% before / {Math.round(100 - sliderPos)}% after
            </div>
        </div>
    );
};

export default BeforeAfterImageSlider;