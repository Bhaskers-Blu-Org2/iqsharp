import { labelFontSize } from "../constants.js";

// Helper functions for basic SVG components
export const group = (...svgElems: (string | string[])[]): string =>
    ['<g>', ...svgElems.flat(), '</g>'].join('\n');
export const controlDot = (x: number, y: number, radius: number = 5): string =>
    `<circle cx="${x}" cy="${y}" r="${radius}" stroke="black" fill="black" stroke-width="1"></circle>`;
export const line = (x1: number, y1: number, x2: number, y2: number, strokeWidth: number = 1): string =>
    `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="black" stroke-width="${strokeWidth}"></line>`;
export const box = (x: number, y: number, width: number, height: number): string =>
    `<rect x="${x}" y ="${y}" width="${width}" height="${height}" stroke="black" fill="white" stroke-width="1"></rect>`;
export const text = (text: string, x: number, y: number, fs: number = labelFontSize): string =>
    `<text font-size="${fs}" font-family="Arial" x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" fill="black">${text}</text>`;
export const arc = (x: number, y: number, rx: number, ry: number): string =>
    `<path d="M ${x + 2 * rx} ${y} A ${rx} ${ry} 0 0 0 ${x} ${y}" stroke="black" fill="none" stroke-width="1"></path>`
export const dashedLine = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="black" stroke-dasharray="8, 8" stroke-width="1"></line>`;
export const dashedBox = (x: number, y: number, width: number, height: number): string =>
    `<rect x="${x}" y ="${y}" width="${width}" height="${height}" stroke="black" fill-opacity="0" stroke-dasharray="8, 8" stroke-width="1"></rect>`;
