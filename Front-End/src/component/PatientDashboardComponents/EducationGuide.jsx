import React, { useState, useEffect } from "react";

const mockEducationalResources = [
    {
        id: "edu_001",
        title: "Proper Toothbrushing",
        description: "Be sure to brush your teeth twice a day for two minutes using fluoride toothpaste.",
        link: "#",
        icon: "🦷",
    },
    {
        id: "edu_002",
        title: "Flossing is Key",
        description: "Don't forget to floss daily to remove plaque between teeth that brushing can't reach.",
        link: "#",
        icon: "🧵",
    },
    {
        id: "edu_003",
        title: "Limit Sweets",
        description: "Reduce sugar consumption to prevent tooth decay and maintain healthy gums.",
        link: "#",
        icon: "🍭",
    },
    {
        id: "edu_004",
        title: "Regular Check-ups",
        description: "Visit the dentist every six months for professional cleaning and early detection of any problems.",
        link: "#",
        icon: "🗓️",
    },
];

const EducationGuide = () => {
    const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        const resourceFlipInterval = setInterval(() => {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentResourceIndex((prevIndex) => (prevIndex + 1) % mockEducationalResources.length);
                setIsFlipping(false);
            }, 500);
        }, 7000);

        return () => {
            clearInterval(resourceFlipInterval);
        };
    }, []);

    const currentResource = mockEducationalResources[currentResourceIndex];

    return (
        <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-lg dark:border-yellow-800/50 dark:bg-yellow-900/20 dark:shadow-xl">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-yellow-800 dark:text-yellow-200">
                <svg
                    className="mr-3 h-7 w-7 text-yellow-600 dark:text-yellow-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M12.42 10.42a2 2 0 11-2.828-2.828L10 7.172l1.414-1.414a2 2 0 112.828 2.828L12.42 10.42zM15.414 7.05a2 2 0 102.828 2.828L15.414 7.05zm-5.656 5.656a2 2 0 102.828-2.828L10 12.828l-1.414 1.414a2 2 0 10-2.828-2.828L10 12.828zM4.586 4.586a2 2 0 10-2.828 2.828L4.586 4.586zm0 10.828a2 2 0 102.828-2.828L4.586 15.414z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                Educational Resources
            </h2>
            {mockEducationalResources.length > 0 ? (
                <div className="relative h-40">
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-500 ease-in-out dark:border-gray-700 dark:bg-gray-700 ${
                            isFlipping ? "opacity-0 scale-90" : "opacity-100 scale-100"
                        }`}
                        // Note: The original 'flip-exit-active' and 'flip-enter-active' classes imply
                        // that the animation is handled by external CSS, as they are not standard Tailwind.
                        // I've replaced them with direct Tailwind transition classes for opacity and scale.
                        // If you have custom CSS animations for 'flip-exit-active' and 'flip-enter-active',
                        // make sure they are globally available and adjust this line accordingly.
                    >
                        {currentResource && (
                            <>
                                <h3 className="flex items-center text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    <span className="mr-2 text-2xl">{currentResource.icon}</span> {currentResource.title}
                                </h3>
                                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">{currentResource.description}</p>
                                <a
                                    href={currentResource.link}
                                    className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-200"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Read More &rarr;
                                </a>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-lg text-gray-600 dark:text-gray-300">No educational resources available at the moment.</p>
            )}
            <div className="mt-4 flex justify-center space-x-2">
                {mockEducationalResources.map((_, idx) => (
                    <span
                        key={idx}
                        className={`block h-3 w-3 cursor-pointer rounded-full ${currentResourceIndex === idx ? "bg-yellow-600 dark:bg-yellow-400" : "bg-gray-300 dark:bg-gray-700"}`}
                        onClick={() => {
                            setIsFlipping(true);
                            setTimeout(() => {
                                setCurrentResourceIndex(idx);
                                setIsFlipping(false);
                            }, 500);
                        }}
                    ></span>
                ))}
            </div>
        </div>
    );
}

export default EducationGuide;