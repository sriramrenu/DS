"use client";

import { useEffect, useRef } from 'react';

export function DotGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let mouseX = -1000;
        let mouseY = -1000;

        const dotSize = 2; // Base radius
        const gap = 40; // Spacing
        const bgDotColor = 'rgba(74, 222, 128, 0.2)'; // User defined #4ade80
        const activeDotColor = 'rgba(74, 222, 128, 1)'; // User defined #4ade80

        // 3D Effect Parameters
        const influenceRadius = 300; // How wide the bulge is
        const bulgeStrength = 50; // How much pixels shift
        const scaleStrength = 2; // How much dots grow

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Create grid
            const cols = Math.ceil(width / gap);
            const rows = Math.ceil(height / gap);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    // Original position
                    const ox = i * gap + (gap / 2);
                    const oy = j * gap + (gap / 2);

                    // Calculate distance to mouse
                    const dx = mouseX - ox; // Vector from dot to mouse
                    const dy = mouseY - oy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Default state
                    let x = ox;
                    let y = oy;
                    let size = dotSize;
                    let alpha = 0.2;

                    // Apply 3D Bulge Effect
                    if (dist < influenceRadius) {
                        // Calculate force (0 to 1) based on distance
                        // Use smooth curve (cosine or quadratic) for better visual
                        const force = Math.pow(1 - (dist / influenceRadius), 2);

                        // Bulge Logic:
                        // "Bulging out" looks like magnifying glass -> points push OUTWARD from center?
                        // Or points pull INWARD to simulating rising?
                        // Usually "Bulge" implies surface rising -> points get closer to viewer (larger)
                        // and might shift relative to perspective.

                        // Let's do a "Fisheye" / "Magnify" effect (Push outward)
                        // This simulates the surface grid expanding as it bulges towards you

                        const angle = Math.atan2(dy, dx);
                        // We want to push AWAY from mouse? Or pull TOWARDS?
                        // Pushing away creates a "hole" or "depression".
                        // Pulling towards creates a "pinch".
                        // Actually, a "bulge" (sphere) visually distorts such that points near center move OUTWARD
                        // because the surface arc length is longer.

                        const displacement = force * bulgeStrength;

                        // Move dot away from mouse center to simulate expansion
                        x = ox - (Math.cos(angle) * displacement);
                        y = oy - (Math.sin(angle) * displacement);

                        // Scale up (stretching/proximity)
                        size = dotSize + (force * scaleStrength);
                        alpha = 0.2 + (force * 0.8);
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
                    ctx.fill();
                }
            }

            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* Base gradient background */}
            {/* Base gradient background - Dark Matrix */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505]" />

            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Vignette Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.8) 100%)'
                }}
            />
        </div>
    );
}
