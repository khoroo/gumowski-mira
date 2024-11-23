"use strict";
// Helper functions with strong typing
const createPoint = (x, y) => ({ x, y });
const calculateG = ({ mu }) => (x) => {
    const x2 = x * x;
    return mu * x + (2 * (1 - mu) * x2) / (1 + x2);
};
// Next point calculator using discriminated unions
const createNextPointCalculator = (calculator) => {
    const g = calculateG(calculator.params);
    return (point) => {
        switch (calculator.type) {
            case 'simple':
                return createPoint(point.y + g(point.x), -point.x + g(point.y + g(point.x)));
            case 'standard': {
                const { alpha, sigma } = calculator.params;
                const nextX = point.y + alpha * point.y * (1 - sigma * point.y * point.y) + g(point.x);
                return createPoint(nextX, -point.x + g(nextX));
            }
        }
    };
};
// Iterator implementation using generator
function* generatePoints(calculator, initial, iterations) {
    const nextPoint = createNextPointCalculator(calculator);
    let current = initial;
    for (let i = 0; i < iterations; i++) {
        current = nextPoint(current);
        yield current;
    }
}
// Visualization helpers
const calculateBounds = (points) => {
    const initial = {
        min: createPoint(Infinity, Infinity),
        max: createPoint(-Infinity, -Infinity)
    };
    return points.reduce((bounds, point) => ({
        min: createPoint(Math.min(bounds.min.x, point.x), Math.min(bounds.min.y, point.y)),
        max: createPoint(Math.max(bounds.max.x, point.x), Math.max(bounds.max.y, point.y))
    }), initial);
};
const createScale = (bounds, viewport) => {
    const xRange = bounds.max.x - bounds.min.x;
    const yRange = bounds.max.y - bounds.min.y;
    const xScale = (viewport.width - 2 * viewport.padding) / xRange;
    const yScale = (viewport.height - 2 * viewport.padding) / yRange;
    return {
        x: (x) => (x - bounds.min.x) * xScale + viewport.padding,
        y: (y) => (y - bounds.min.y) * yScale + viewport.padding
    };
};
// Main visualization function
const visualizeGumowskiMira = (ctx, points, viewport, options) => {
    // Calculate bounds and scaling
    const bounds = calculateBounds(points);
    const scale = createScale(bounds, viewport);
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    // Draw points efficiently
    ctx.beginPath();
    points.forEach(point => {
        const x = scale.x(point.x);
        const y = scale.y(point.y);
        ctx.moveTo(x, y);
        ctx.arc(x, y, options.radius, 0, Math.PI * 2);
    });
    ctx.fillStyle = options.color;
    ctx.fill();
};
// Example usage
const main = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    // Configuration
    const params = {
        alpha: 0.009,
        sigma: 0.05,
        mu: -0.801
    };
    const calculator = {
        type: 'standard',
        params
    };
    const viewport = {
        width: canvas.width,
        height: canvas.height,
        padding: 50
    };
    const renderOptions = {
        color: 'rgba(0, 0, 0, 0.8)',
        radius: 0.75
    };
    // Generate points
    const initialPoint = createPoint(1, 1);
    const points = Array.from(generatePoints(calculator, initialPoint, 20000));
    // Visualize
    visualizeGumowskiMira(ctx, points, viewport, renderOptions);
};
// Initialize
window.addEventListener('load', main);
