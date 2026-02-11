"use client";

import { useEffect, useRef } from 'react';

export function DataElements() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Clear existing elements
        container.innerHTML = '';

        // Grade symbols
        const grades = ['A+', '100%', '95%', 'A', '98%', 'S', 'A+', '99%'];
        grades.forEach((grade, i) => {
            const elem = document.createElement('div');
            elem.className = 'floating-grade';
            elem.textContent = grade;
            elem.style.left = `${(i + 1) * 11}%`;
            elem.style.animationDelay = `${i * 1.5}s`;
            elem.style.animationDuration = `${15 + Math.random() * 5}s`;
            container.appendChild(elem);
        });

        // Data packets
        const dataPackets = ['📊', '📈', '📉', '💾', '🔢', '📊', '📈', '💾'];
        dataPackets.forEach((packet, i) => {
            const elem = document.createElement('div');
            elem.className = 'data-packet';
            elem.textContent = packet;
            elem.style.top = `${(i + 1) * 11}%`;
            elem.style.animationDelay = `${i * 2}s`;
            elem.style.animationDuration = `${20 + Math.random() * 5}s`;
            container.appendChild(elem);
        });

        // Binary streams
        const binaryCount = 5;
        for (let i = 0; i < binaryCount; i++) {
            const elem = document.createElement('div');
            elem.className = 'binary-stream';

            // Generate random binary string
            let binary = '';
            for (let j = 0; j < 8; j++) {
                binary += Math.random() > 0.5 ? '1' : '0';
            }
            elem.textContent = binary;

            elem.style.left = `${(i + 1) * 18}%`;
            elem.style.animationDelay = `${i * 3}s`;
            elem.style.animationDuration = `${25 + Math.random() * 5}s`;
            container.appendChild(elem);
        }

    }, []);

    return <div ref={containerRef} className="data-elements-container" />;
}
