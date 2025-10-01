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
        const percent = (newX / rect.width) * 100;
        setSliderPos(percent);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleTouchMove = useCallback((e) => {
        if (!isDragging || !containerRef.current || !e.touches[0]) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        let newX = e.touches[0].clientX - rect.left;
        newX = Math.max(0, Math.min(newX, rect.width));
        const percent = (newX / rect.width) * 100;
        setSliderPos(percent);
    }, [isDragging]);
    
    const handleTouchStart = (e) => {
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
            window.addEventListener('touchmove', handleTouchMove);
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
        <div className="w-full max-w-2xl mx-auto">
            {/* Container with dynamic aspect ratio */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden select-none bg-gray-100 rounded-lg shadow-lg"
                style={{ 
                    aspectRatio: aspectRatio,
                    maxHeight: '50vh'
                }}
            >
                {/* Loading state */}
                {imagesLoaded < 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-0">
                        <div className="text-gray-500">Loading images...</div>
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
                        style={{ 
                            display: imagesLoaded < 2 ? 'none' : 'block'
                        }}
                    />
                </div>

                {/* After Image - Clipped by the slider position */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ 
                        clipPath: `inset(0 0 0 ${sliderPos}%)`,
                        display: imagesLoaded < 2 ? 'none' : 'block'
                    }}
                >
                    <img
                        src={afterImageUrl}
                        alt="After Treatment"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable="false"
                        onLoad={handleImageLoad}
                    />
                </div>
                
                {/* Separator / Handle */}
                <div
                    className="absolute inset-y-0 cursor-ew-resize flex items-center justify-center transition-all duration-100 ease-linear"
                    style={{ 
                        left: `${sliderPos}%`, 
                        transform: 'translateX(-50%)',
                        zIndex: 10
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* Arrow Handle */}
                    <div className="h-12 w-10 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 shadow-lg hover:bg-blue-50 transition-colors dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400">
                        &#x2194;
                    </div>
                    
                    {/* Vertical Line */}
                    <div 
                        className="absolute w-0.5 h-full bg-blue-500 pointer-events-none"
                        style={{ zIndex: -1 }}
                    />
                </div>
            </div>
            
            {/* Optional: Position indicator */}
            <div className="mt-2 text-center text-sm text-gray-600">
                Slide to compare • {Math.round(sliderPos)}% before / {Math.round(100 - sliderPos)}% after
            </div>
        </div>
    );
};

export default BeforeAfterImageSlider;