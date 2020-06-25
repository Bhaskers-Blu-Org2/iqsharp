define(["require", "exports", "./constants.js", "./fontSizes.js"], function (require, exports, constants_js_1, fontSizes_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Calculate the width of a gate, given its metadata.
     *
     * @param metadata Metadata of a given gate.
     *
     * @returns Width of given gate (in pixels).
     */
    var getGateWidth = function (_a) {
        var type = _a.type, label = _a.label, argStr = _a.argStr, width = _a.width;
        switch (type) {
            case constants_js_1.GateType.ClassicalControlled:
                // Already computed before.
                return width;
            case constants_js_1.GateType.Measure:
            case constants_js_1.GateType.Cnot:
            case constants_js_1.GateType.Swap:
                return constants_js_1.minGateWidth;
            default:
                var labelWidth = _getStringWidth(label);
                var argsWidth = (argStr != null) ? _getStringWidth(argStr, constants_js_1.argsFontSize) : 0;
                var textWidth = Math.max(labelWidth, argsWidth) + constants_js_1.labelPadding * 2;
                return Math.max(constants_js_1.minGateWidth, textWidth);
        }
    };
    exports.getGateWidth = getGateWidth;
    /**
     * Get the width of a string with font-size `fontSize` and font-family Arial.
     *
     * @param str      Input string.
     * @param fontSize Font size of `str`.
     *
     * @returns Pixel width of given string.
     */
    var _getStringWidth = function (str, fontSize) {
        if (fontSize === void 0) { fontSize = constants_js_1.labelFontSize; }
        var scale = fontSize / 100;
        var unScaledWidth = str.split('').reduce(function (totalLen, ch) { return totalLen + fontSizes_js_1.default[ch][0]; }, 0);
        return scale * unScaledWidth;
    };
    exports._getStringWidth = _getStringWidth;
});
