import React, { useState, useRef } from 'react';
import Image from 'next/image';

const DraggableImage = ({ imageUrl }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseDown = e => {
        e.preventDefault();
        setIsDragging(true);
        setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = e => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - start.x,
            y: e.clientY - start.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center"
        >
            <Image
                src={imageUrl}
                alt="preview"
                width={1000}
                height={1000}
                draggable={false}
                className="select-none pointer-events-none object-contain transition-transform duration-75 ease-linear"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(2)`,
                }}
            />
        </div>
    );
};

export default DraggableImage;
