define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Enum for the various gate operations handled.
     */
    var GateType;
    (function (GateType) {
        /** Measurement gate. */
        GateType[GateType["Measure"] = 0] = "Measure";
        /** CNOT gate. */
        GateType[GateType["Cnot"] = 1] = "Cnot";
        /** SWAP gate. */
        GateType[GateType["Swap"] = 2] = "Swap";
        /** Single/multi qubit unitary gate. */
        GateType[GateType["Unitary"] = 3] = "Unitary";
        /** Single/multi controlled unitary gate. */
        GateType[GateType["ControlledUnitary"] = 4] = "ControlledUnitary";
        /** Nested group of classically-controlled gates. */
        GateType[GateType["ClassicalControlled"] = 5] = "ClassicalControlled";
        /** Invalid gate. */
        GateType[GateType["Null"] = 6] = "Null";
    })(GateType = exports.GateType || (exports.GateType = {}));
    ;
    // Display attributes
    /** Left padding of SVG. */
    exports.leftPadding = 20;
    /** x coordinate for first operation on each register. */
    exports.startX = 80;
    /** y coordinate of first register. */
    exports.startY = 40;
    /** Minimum width of each gate. */
    exports.minGateWidth = 40;
    /** Height of each gate. */
    exports.gateHeight = 40;
    /** Padding on each side of gate. */
    exports.gatePadding = 10;
    /** Padding on each side of gate label. */
    exports.labelPadding = 10;
    /** Height between each qubit register. */
    exports.registerHeight = exports.gateHeight + exports.gatePadding * 2;
    /** Height between classical registers. */
    exports.classicalRegHeight = exports.gateHeight;
    /** Classical box inner padding. */
    exports.classicalBoxPadding = 15;
    /** Additional offset for control button. */
    exports.controlBtnOffset = 40;
    /** Control button radius. */
    exports.controlBtnRadius = 15;
    /** Default font size for gate labels. */
    exports.labelFontSize = 14;
    /** Default font size for gate arguments. */
    exports.argsFontSize = 12;
    /** Starting x coord for each register wire. */
    exports.regLineStart = 40;
});
