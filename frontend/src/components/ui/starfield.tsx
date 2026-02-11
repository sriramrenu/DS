"use client";

import { useEffect, useRef } from 'react';

export function Starfield() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const starCount = 150;

        // Clear existing stars
        container.innerHTML = '';

        // Create stars
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            const size = Math.random();

            // Determine star size class
            if (size < 0.6) {
                star.className = 'star small';
            } else if (size < 0.9) {
                star.className = 'star medium';
            } else {
                star.className = 'star large';
            }

            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;

            // Random animation delay for twinkling
            star.style.animationDelay = `${Math.random() * 5}s`;

            container.appendChild(star);
        }
    }, []);

    return <div ref={containerRef} className="stars-container" />;
}
