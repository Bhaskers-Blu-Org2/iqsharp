define(["require", "exports", "../register", "../constants"], function (require, exports, register_1, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * `formatInputs` takes in an array of Qubits and outputs the SVG string of formatted
     * qubit wires and a mapping from register IDs to register metadata (for rendering).
     *
     * @param qubits List of declared qubits.
     *
     * @returns returns the SVG string of formatted qubit wires, a mapping from registers
     *          to y coord and total SVG height.
     */
    var formatInputs = function (qubits) {
        var qubitWires = [];
        var registers = {};
        var currY = constants_1.startY;
        qubits.forEach(function (_a) {
            var id = _a.id, numChildren = _a.numChildren;
            // Add qubit wire to list of qubit wires
            qubitWires.push(_qubitInput(currY));
            // Create qubit register
            registers[id] = { type: register_1.RegisterType.Qubit, y: currY };
            // If there are no attached classical registers, increment y by fixed register height
            if (numChildren == null || numChildren === 0) {
                currY += constants_1.registerHeight;
                return;
            }
            // Increment current height by classical register height for attached classical registers
            currY += constants_1.classicalRegHeight;
            // Add classical wires
            registers[id].children = Array.from(Array(numChildren), function (_) {
                var clsReg = { type: register_1.RegisterType.Classical, y: currY };
                currY += constants_1.classicalRegHeight;
                return clsReg;
            });
        });
        return {
            qubitWires: qubitWires.join('\n'),
            registers: registers,
            svgHeight: currY
        };
    };
    exports.formatInputs = formatInputs;
    /**
     * Generate the SVG text component for the input qubit register.
     *
     * @param y y coord of input wire to render in SVG.
     *
     * @returns SVG text component for the input register.
     */
    var _qubitInput = function (y) {
        return "<text x=\"" + constants_1.leftPadding + "\" y=\"" + y + "\" dominant-baseline=\"middle\" text-anchor=\"start\">|0\u27E9</text>";
    };
    exports._qubitInput = _qubitInput;
});
