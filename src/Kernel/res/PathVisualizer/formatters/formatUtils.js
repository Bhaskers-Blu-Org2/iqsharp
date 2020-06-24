var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "../constants"], function (require, exports, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Helper functions for basic SVG components
    exports.group = function () {
        var svgElems = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            svgElems[_i] = arguments[_i];
        }
        return __spreadArrays(['<g>'], svgElems.flat(), ['</g>']).join('\n');
    };
    exports.controlDot = function (x, y, radius) {
        if (radius === void 0) { radius = 5; }
        return "<circle cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + radius + "\" stroke=\"black\" fill=\"black\" stroke-width=\"1\"></circle>";
    };
    exports.line = function (x1, y1, x2, y2, strokeWidth) {
        if (strokeWidth === void 0) { strokeWidth = 1; }
        return "<line x1=\"" + x1 + "\" x2=\"" + x2 + "\" y1=\"" + y1 + "\" y2=\"" + y2 + "\" stroke=\"black\" stroke-width=\"" + strokeWidth + "\"></line>";
    };
    exports.box = function (x, y, width, height) {
        return "<rect x=\"" + x + "\" y =\"" + y + "\" width=\"" + width + "\" height=\"" + height + "\" stroke=\"black\" fill=\"white\" stroke-width=\"1\"></rect>";
    };
    exports.text = function (text, x, y, fs) {
        if (fs === void 0) { fs = constants_1.labelFontSize; }
        return "<text font-size=\"" + fs + "\" font-family=\"Arial\" x=\"" + x + "\" y=\"" + y + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"black\">" + text + "</text>";
    };
    exports.arc = function (x, y, rx, ry) {
        return "<path d=\"M " + (x + 2 * rx) + " " + y + " A " + rx + " " + ry + " 0 0 0 " + x + " " + y + "\" stroke=\"black\" fill=\"none\" stroke-width=\"1\"></path>";
    };
    exports.dashedLine = function (x1, y1, x2, y2) {
        return "<line x1=\"" + x1 + "\" x2=\"" + x2 + "\" y1=\"" + y1 + "\" y2=\"" + y2 + "\" stroke=\"black\" stroke-dasharray=\"8, 8\" stroke-width=\"1\"></line>";
    };
    exports.dashedBox = function (x, y, width, height) {
        return "<rect x=\"" + x + "\" y =\"" + y + "\" width=\"" + width + "\" height=\"" + height + "\" stroke=\"black\" fill-opacity=\"0\" stroke-dasharray=\"8, 8\" stroke-width=\"1\"></rect>";
    };
});
