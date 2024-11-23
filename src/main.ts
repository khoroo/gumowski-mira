// main.ts

interface Point {
    readonly x: number;
    readonly y: number;
}

interface GumowskiParams {
    readonly alpha: number;
    readonly sigma: number;
    readonly mu: number;
}

interface SavedResult {
    params: GumowskiParams;
    rating: 'good' | 'bad';
    timestamp: string;
}
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



// Add state management
let currentParams: GumowskiParams;
const savedResults: SavedResult[] = [];

const randomFloat = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

const knownParams: GumowskiParams[] = [
    { alpha: 0.8244391555, sigma: 0.1774071817, mu: -0.5116492043 },
    { alpha: 0.2773133875, sigma: 0.606448743, mu: -0.867253365 },
    { alpha: 0.4828030715, sigma: 0.0229754889, mu: 0.547388765 },
    { alpha: 0.0458912996, sigma: 0.4976365791, mu: -0.3432564696 },
    { alpha: 0.494631299, sigma: 0.1436555705, mu: -0.4371344738 },
    { alpha: 0.6278730919, sigma: 0.1061967449, mu: 0.4625240818 },
    { alpha: 0.2285134534, sigma: 0.8234970213, mu: -0.1421593999 },
    { alpha: 0.8059471909, sigma: 0.6146615464, mu: 0.6989158747 },
    { alpha: 0.014188807, sigma: 0.5116789189, mu: -0.709636987 },
    { alpha: 0.510675207, sigma: 0.6179087377, mu: -0.5320875884 },
    { alpha: 0.480478471, sigma: 0.6285355241, mu: 0.1456679021 },
    { alpha: 0.0667867267, sigma: 0.0156868822, mu: -0.4986787562 },
    { alpha: 0.0609237318, sigma: 0.4147179456, mu: 0.3022867769 },
    { alpha: 0.0377529142, sigma: 0.7564536638, mu: -0.3309395722 },
    { alpha: 0.0127874863, sigma: 0.2534660034, mu: 0.0620849106 },
    { alpha: 0.4901955992, sigma: 0.6464701979, mu: 0.7065678246 },
    { alpha: 0.9082379408, sigma: 0.8003195728, mu: 0.6174691406 },
    { alpha: 0.5578971949, sigma: 0.2023314395, mu: -0.0058459365 },
    { alpha: 0.1613274063, sigma: 0.9675522216, mu: 0.0177000695 },
    { alpha: 0.0312776923, sigma: 0.1274765691, mu: 0.1076720964 },
    { alpha: 0.9065307782, sigma: 0.2113498598, mu: 0.3449995466 },
    { alpha: 0.3745206832, sigma: 0.628306031, mu: 0.0837386053 },
    { alpha: 0.8213463426, sigma: 0.0293553252, mu: 0.4230726506 },
    { alpha: 0.4126543676, sigma: 0.5885845043, mu: -0.2138337336 },
    { alpha: 0.0350114025, sigma: 0.1551110644, mu: 0.8588986349 },
    { alpha: 0.0021805721, sigma: 0.0876592845, mu: -0.8838931438 },
    { alpha: 0.9300093068, sigma: 0.2984211352, mu: 0.5246134282 },
    { alpha: 0.0404903983, sigma: 0.5136701621, mu: -0.2481335823 }
];

const generateNewParams = (): GumowskiParams => ({
    alpha: randomFloat(0, 1),
    sigma: randomFloat(0, 1),
    mu: randomFloat(-1, 1)
});
//const generateNewParams = (): GumowskiParams => knownParams[Math.floor(Math.random() * knownParams.length)];


const exportToCSV = (results: SavedResult[]): void => {
    const headers = ['timestamp', 'rating', 'alpha', 'sigma', 'mu'];
    const rows = results.map(result => [
        result.timestamp,
        result.rating,
        result.params.alpha.toString(),
        result.params.sigma.toString(),
        result.params.mu.toString()
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'gumowski-results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const generateAndRender = (ctx: CanvasRenderingContext2D, viewport: Viewport, renderOptions: RenderOptions): void => {
    currentParams = generateNewParams();
    
    const calculator: PointCalculator = {
        type: 'standard',
        params: currentParams
    };

    // Generate points
    const initialPoint = createPoint(1, 1);
    const points = Array.from(generatePoints(calculator, initialPoint, 20000));

    // Visualize
    visualizeGumowskiMira(ctx, points, viewport, renderOptions);
};

const saveRating = (rating: 'good' | 'bad'): void => {
    savedResults.push({
        params: currentParams,
        rating,
        timestamp: new Date().toISOString()
    });
};

// Main function
const main = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    const viewport: Viewport = {
        width: canvas.width,
        height: canvas.height,
        padding: 50
    };

    const renderOptions: RenderOptions = {
        color: 'rgba(0, 0, 0, 0.8)',
        radius: 0.75
    };

    // Add button event listeners
    const goodButton = document.getElementById('goodButton') as HTMLButtonElement;
    const badButton = document.getElementById('badButton') as HTMLButtonElement;
    const rerollButton = document.getElementById('rerollButton') as HTMLButtonElement;
    const exportButton = document.getElementById('exportButton') as HTMLButtonElement;

    goodButton.addEventListener('click', () => {
        saveRating('good');
        generateAndRender(ctx, viewport, renderOptions);
    });

    badButton.addEventListener('click', () => {
        saveRating('bad');
        generateAndRender(ctx, viewport, renderOptions);
    });

    rerollButton.addEventListener('click', () => {
        generateAndRender(ctx, viewport, renderOptions);
    });

    exportButton.addEventListener('click', () => {
        exportToCSV(savedResults);
    });

    // Initial render
    generateAndRender(ctx, viewport, renderOptions);
};

// Initialize
window.addEventListener('load', main);
