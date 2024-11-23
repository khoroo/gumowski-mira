interface Point {
    readonly x: number;
    readonly y: number;
}

interface GumowskiParams {
    readonly alpha: number;
    readonly sigma: number;
    readonly mu: number;
}

// Discriminated union for different types of point calculations
type PointCalculator = 
    | { type: 'simple'; params: GumowskiParams }
    | { type: 'standard'; params: GumowskiParams };

interface Viewport {
    readonly width: number;
    readonly height: number;
    readonly padding: number;
}

interface RenderOptions {
    readonly color: string;
    readonly radius: number;
}

// Helper functions with strong typing
const createPoint = (x: number, y: number): Point => ({ x, y });

const calculateG = ({ mu }: GumowskiParams) => (x: number): number => {
    const x2 = x * x;
    return mu * x + (2 * (1 - mu) * x2) / (1 + x2);
};

// Next point calculator using discriminated unions
const createNextPointCalculator = (calculator: PointCalculator) => {
    const g = calculateG(calculator.params);

    return (point: Point): Point => {
        switch (calculator.type) {
            case 'simple':
                return createPoint(
                    point.y + g(point.x),
                    -point.x + g(point.y + g(point.x))
                );
            
            case 'standard': {
                const { alpha, sigma } = calculator.params;
                const nextX = point.y + alpha * point.y * (1 - sigma * point.y * point.y) + g(point.x);
                return createPoint(
                    nextX,
                    -point.x + g(nextX)
                );
            }
        }
    };
};

// Iterator implementation using generator
function* generatePoints(
    calculator: PointCalculator,
    initial: Point,
    iterations: number
): Generator<Point> {
    const nextPoint = createNextPointCalculator(calculator);
    let current = initial;

    for (let i = 0; i < iterations; i++) {
        current = nextPoint(current);
        yield current;
    }
}

// Data structures for visualization
interface Bounds {
    readonly min: Point;
    readonly max: Point;
}

interface Scale {
    readonly x: (n: number) => number;
    readonly y: (n: number) => number;
}

// Visualization helpers
const calculateBounds = (points: Point[]): Bounds => {
    const initial: Bounds = {
        min: createPoint(Infinity, Infinity),
        max: createPoint(-Infinity, -Infinity)
    };

    return points.reduce((bounds, point) => ({
        min: createPoint(
            Math.min(bounds.min.x, point.x),
            Math.min(bounds.min.y, point.y)
        ),
        max: createPoint(
            Math.max(bounds.max.x, point.x),
            Math.max(bounds.max.y, point.y)
        )
    }), initial);
};

const createScale = (bounds: Bounds, viewport: Viewport): Scale => {
    const xRange = bounds.max.x - bounds.min.x;
    const yRange = bounds.max.y - bounds.min.y;
    
    const xScale = (viewport.width - 2 * viewport.padding) / xRange;
    const yScale = (viewport.height - 2 * viewport.padding) / yRange;
    
    return {
        x: (x: number) => (x - bounds.min.x) * xScale + viewport.padding,
        y: (y: number) => (y - bounds.min.y) * yScale + viewport.padding
    };
};

// Main visualization function
const visualizeGumowskiMira = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    viewport: Viewport,
    options: RenderOptions
): void => {
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
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Configuration
    const params: GumowskiParams = {
        alpha: 0.009,
        sigma: 0.05,
        mu: -0.801
    };

    const calculator: PointCalculator = {
        type: 'standard',
        params
    };

    const viewport: Viewport = {
        width: canvas.width,
        height: canvas.height,
        padding: 50
    };

    const renderOptions: RenderOptions = {
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
