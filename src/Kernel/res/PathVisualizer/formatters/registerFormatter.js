define(["require", "exports", "../constants.js", "./formatUtils.js"], function (require, exports, constants_js_1, formatUtils_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Generate the SVG representation of the qubit register wires in `registers` and the classical wires
     * stemming from each measurement gate.
     *
     * @param registers    Map from register IDs to register metadata.
     * @param measureGates Array of measurement gates metadata.
     * @param endX         End x coord.
     *
     * @returns SVG representation of register wires.
     */
    var formatRegisters = function (registers, measureGates, endX) {
        var formattedRegs = [];
        // Render qubit wires
        for (var qId in registers) {
            formattedRegs.push(_qubitRegister(Number(qId), endX, registers[qId].y));
        }
        // Render classical wires
        measureGates.forEach(function (_a) {
            var type = _a.type, x = _a.x, targetsY = _a.targetsY, controlsY = _a.controlsY;
            if (type !== constants_js_1.GateType.Measure)
                return;
            var gateY = controlsY[0];
            targetsY.forEach(function (y) {
                formattedRegs.push(_classicalRegister(x, gateY, endX, y));
            });
        });
        return formattedRegs.join('\n');
    };
    exports.formatRegisters = formatRegisters;
    /**
     * Generates the SVG representation of a classical register.
     *
     * @param startX Start x coord.
     * @param gateY  y coord of measurement gate.
     * @param endX   End x coord.
     * @param wireY  y coord of wire.
     *
     * @returns SVG representation of the given classical register.
     */
    var _classicalRegister = function (startX, gateY, endX, wireY) {
        var wirePadding = 1;
        // Draw vertical lines
        var vLine1 = formatUtils_js_1.line(startX + wirePadding, gateY, startX + wirePadding, wireY - wirePadding, 0.5);
        var vLine2 = formatUtils_js_1.line(startX - wirePadding, gateY, startX - wirePadding, wireY + wirePadding, 0.5);
        // Draw horizontal lines
        var hLine1 = formatUtils_js_1.line(startX + wirePadding, wireY - wirePadding, endX, wireY - wirePadding, 0.5);
        var hLine2 = formatUtils_js_1.line(startX - wirePadding, wireY + wirePadding, endX, wireY + wirePadding, 0.5);
        var svg = [vLine1, vLine2, hLine1, hLine2].join('\n');
        return svg;
    };
    exports._classicalRegister = _classicalRegister;
    /**
     * Generates the SVG representation of a qubit register.
     *
     * @param qId         Qubit register index.
     * @param endX        End x coord.
     * @param y           y coord of wire.
     * @param labelOffset y offset for wire label.
     *
     * @returns SVG representation of the given qubit register.
     */
    var _qubitRegister = function (qId, endX, y, labelOffset) {
        if (labelOffset === void 0) { labelOffset = 16; }
        var labelY = y - labelOffset;
        var wire = formatUtils_js_1.line(constants_js_1.regLineStart, y, endX, y);
        var label = "<text x=\"" + constants_js_1.regLineStart + "\" y=\"" + labelY + "\" dominant-baseline=\"hanging\" text-anchor=\"start\" font-size=\"75%\">q" + qId + "</text>";
        var svg = [wire, label].join('\n');
        return svg;
    };
    exports._qubitRegister = _qubitRegister;
});
