var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "../constants.js", "./formatUtils.js"], function (require, exports, constants_js_1, formatUtils_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Given an array of operations (in metadata format), return the SVG representation.
     *
     * @param opsMetadata Array of Metadata representation of operations.
     *
     * @returns SVG representation of operations.
     */
    var formatGates = function (opsMetadata) {
        var formattedGates = opsMetadata.map(_formatGate);
        return formattedGates.flat().join('\n');
    };
    exports.formatGates = formatGates;
    /**
     * Takes in an operation's metadata and formats it into SVG.
     *
     * @param metadata Metadata object representation of gate.
     *
     * @returns SVG representation of gate.
     */
    var _formatGate = function (metadata) {
        var type = metadata.type, x = metadata.x, controlsY = metadata.controlsY, targetsY = metadata.targetsY, label = metadata.label, argStr = metadata.argStr, width = metadata.width;
        switch (type) {
            case constants_js_1.GateType.Measure:
                return _measure(x, controlsY[0], targetsY[0]);
            case constants_js_1.GateType.Unitary:
                return _unitary(label, x, targetsY, width, argStr);
            case constants_js_1.GateType.Swap:
                if (controlsY.length > 0)
                    return _controlledGate(metadata);
                else
                    return _swap(x, targetsY);
            case constants_js_1.GateType.Cnot:
            case constants_js_1.GateType.ControlledUnitary:
                return _controlledGate(metadata);
            case constants_js_1.GateType.ClassicalControlled:
                return _classicalControlled(metadata);
            default:
                throw new Error("ERROR: unknown gate (" + label + ") of type " + type + ".");
        }
    };
    exports._formatGate = _formatGate;
    /**
     * Creates a measurement gate at the x position, where qy and cy are
     * the y coords of the qubit register and classical register, respectively.
     *
     * @param x  x coord of measurement gate.
     * @param qy y coord of qubit register.
     * @param cy y coord of classical register.
     *
     * @returns SVG representation of measurement gate.
     */
    var _measure = function (x, qy, cy) {
        x -= constants_js_1.minGateWidth / 2;
        var width = constants_js_1.minGateWidth, height = constants_js_1.gateHeight;
        // Draw measurement box
        var mBox = formatUtils_js_1.box(x, qy - height / 2, width, height);
        var mArc = formatUtils_js_1.arc(x + 5, qy + 2, width / 2 - 5, height / 2 - 8);
        var meter = formatUtils_js_1.line(x + width / 2, qy + 8, x + width - 8, qy - height / 2 + 8);
        var svg = formatUtils_js_1.group(mBox, mArc, meter);
        return svg;
    };
    exports._measure = _measure;
    /**
     * Creates the SVG for a unitary gate on an arbitrary number of qubits.
     *
     * @param label            Gate label.
     * @param x                x coord of gate.
     * @param y                Array of y coords of registers acted upon by gate.
     * @param width            Width of gate.
     * @param argStr           Arguments passed in to gate.
     * @param renderDashedLine If true, draw dashed lines between non-adjacent unitaries.
     *
     * @returns SVG representation of unitary gate.
     */
    var _unitary = function (label, x, y, width, argStr, renderDashedLine) {
        if (renderDashedLine === void 0) { renderDashedLine = true; }
        if (y.length === 0)
            return "";
        // Sort y in ascending order
        y.sort(function (y1, y2) { return y1 - y2; });
        // Group adjacent registers
        var prevY = y[0];
        var regGroups = y.reduce(function (acc, currY) {
            // Registers are defined to be adjacent if they differ by registerHeight in their y coord
            // Raphael: Is there a better way of doing this? (i.e. split into y and heights in processInstructions)
            if (acc.length === 0 || currY - prevY > constants_js_1.registerHeight)
                acc.push([currY]);
            else
                acc[acc.length - 1].push(currY);
            prevY = currY;
            return acc;
        }, []);
        // Render each group as a separate unitary boxes
        var unitaryBoxes = regGroups.map(function (group) {
            var maxY = group[group.length - 1], minY = group[0];
            var height = maxY - minY + constants_js_1.gateHeight;
            return _unitaryBox(label, x, minY, width, height, argStr);
        });
        // Draw dashed line between disconnected unitaries
        if (renderDashedLine && unitaryBoxes.length > 1) {
            var maxY = y[y.length - 1], minY = y[0];
            var vertLine = formatUtils_js_1.dashedLine(x, minY, x, maxY);
            return __spreadArrays([vertLine], unitaryBoxes).join('\n');
        }
        else
            return unitaryBoxes.join('\n');
    };
    exports._unitary = _unitary;
    /**
     * Generates SVG representation of the boxed unitary gate symbol.
     *
     * @param label  Label for unitary operation.
     * @param x      x coord of gate.
     * @param y      y coord of gate.
     * @param width  Width of gate.
     * @param height Height of gate.
     * @param argStr Arguments passed in to gate.
     *
     * @returns SVG representation of unitary box.
     */
    var _unitaryBox = function (label, x, y, width, height, argStr) {
        if (height === void 0) { height = constants_js_1.gateHeight; }
        y -= constants_js_1.gateHeight / 2;
        var uBox = formatUtils_js_1.box(x - width / 2, y, width, height);
        var labelY = y + height / 2 - ((argStr == null) ? 0 : 7);
        var labelText = formatUtils_js_1.text(label, x, labelY);
        var elems = [uBox, labelText];
        if (argStr != null) {
            var argStrY = y + height / 2 + 8;
            var argText = formatUtils_js_1.text(argStr, x, argStrY, constants_js_1.argsFontSize);
            elems.push(argText);
        }
        var svg = formatUtils_js_1.group(elems);
        return svg;
    };
    /**
     * Creates the SVG for a SWAP gate on y coords given by targetsY.
     *
     * @param x          Centre x coord of SWAP gate.
     * @param targetsY   y coords of target registers.
     *
     * @returns SVG representation of SWAP gate.
     */
    var _swap = function (x, targetsY) {
        // Get SVGs of crosses
        var crosses = targetsY.map(function (y) { return _cross(x, y); });
        var vertLine = formatUtils_js_1.line(x, targetsY[0], x, targetsY[1]);
        var svg = formatUtils_js_1.group(crosses, vertLine);
        return svg;
    };
    exports._swap = _swap;
    /**
     * Generates cross for display in SWAP gate.
     *
     * @param x x coord of gate.
     * @param y y coord of gate.
     *
     * @returns SVG representation for cross.
     */
    var _cross = function (x, y) {
        var radius = 8;
        var line1 = formatUtils_js_1.line(x - radius, y - radius, x + radius, y + radius);
        var line2 = formatUtils_js_1.line(x - radius, y + radius, x + radius, y - radius);
        return [line1, line2].join('\n');
    };
    /**
     * Produces the SVG representation of a controlled gate on multiple qubits.
     *
     * @param metadata Metadata of controlled gate.
     *
     * @returns SVG representation of controlled gate.
     */
    var _controlledGate = function (metadata) {
        var targetGateSvgs = [];
        var type = metadata.type, x = metadata.x, controlsY = metadata.controlsY, targetsY = metadata.targetsY, label = metadata.label, argStr = metadata.argStr, width = metadata.width;
        // Get SVG for target gates
        switch (type) {
            case constants_js_1.GateType.Cnot:
                targetsY.forEach(function (y) { return targetGateSvgs.push(_oplus(x, y)); });
                break;
            case constants_js_1.GateType.Swap:
                targetsY.forEach(function (y) { return targetGateSvgs.push(_cross(x, y)); });
                break;
            case constants_js_1.GateType.ControlledUnitary:
                targetGateSvgs.push(_unitary(label, x, targetsY, width, argStr, false));
                break;
            default:
                throw new Error("ERROR: Unrecognized gate: " + label + " of type " + type);
        }
        // Get SVGs for control dots
        var controlledDotsSvg = controlsY.map(function (y) { return formatUtils_js_1.controlDot(x, y); });
        // Create control lines
        var maxY = Math.max.apply(Math, __spreadArrays(controlsY, targetsY));
        var minY = Math.min.apply(Math, __spreadArrays(controlsY, targetsY));
        var vertLine = formatUtils_js_1.line(x, minY, x, maxY);
        var svg = formatUtils_js_1.group(vertLine, controlledDotsSvg, targetGateSvgs);
        return svg;
    };
    exports._controlledGate = _controlledGate;
    /**
     * Generates $\oplus$ symbol for display in CNOT gate.
     *
     * @param x x coordinate of gate.
     * @param y y coordinate of gate.
     * @param r radius of circle.
     *
     * @returns SVG representation of $\oplus$ symbol.
     */
    var _oplus = function (x, y, r) {
        if (r === void 0) { r = 15; }
        var circle = "<circle cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + r + "\" stroke=\"black\" fill=\"white\" stroke-width=\"1\"></circle>";
        var vertLine = formatUtils_js_1.line(x, y - r, x, y + r);
        var horLine = formatUtils_js_1.line(x - r, y, x + r, y);
        var svg = formatUtils_js_1.group(circle, vertLine, horLine);
        return svg;
    };
    /**
     * Generates the SVG for a classically controlled group of oeprations.
     *
     * @param metadata Metadata representation of gate.
     * @param padding  Padding within dashed box.
     *
     * @returns SVG representation of gate.
     */
    var _classicalControlled = function (metadata, padding) {
        if (padding === void 0) { padding = constants_js_1.classicalBoxPadding; }
        var x = metadata.x, controlsY = metadata.controlsY, targetsY = metadata.targetsY, width = metadata.width, children = metadata.children, htmlClass = metadata.htmlClass;
        var controlY = controlsY[0];
        if (htmlClass == null)
            htmlClass = 'cls-control';
        // Get SVG for gates controlled on 0 and make them hidden initially
        var childrenZero = (children != null) ? formatGates(children[0]) : '';
        childrenZero = "<g class=\"" + htmlClass + "-zero hidden\">\r\n" + childrenZero + "</g>";
        // Get SVG for gates controlled on 1
        var childrenOne = (children != null) ? formatGates(children[1]) : '';
        childrenOne = "<g class=\"" + htmlClass + "-one\">\r\n" + childrenOne + "</g>";
        // Draw control button and attached dashed line to dashed box
        var controlCircleX = x + constants_js_1.controlBtnRadius;
        var controlCircle = _controlCircle(controlCircleX, controlY, htmlClass);
        var lineY1 = controlY + constants_js_1.controlBtnRadius, lineY2 = controlY + constants_js_1.classicalRegHeight / 2;
        var vertLine = formatUtils_js_1.dashedLine(controlCircleX, lineY1, controlCircleX, lineY2);
        x += constants_js_1.controlBtnOffset;
        var horLine = formatUtils_js_1.dashedLine(controlCircleX, lineY2, x, lineY2);
        width = width - constants_js_1.controlBtnOffset + (padding - constants_js_1.classicalBoxPadding) * 2;
        x += constants_js_1.classicalBoxPadding - padding;
        var y = targetsY[0] - constants_js_1.gateHeight / 2 - padding;
        var height = targetsY[1] - targetsY[0] + constants_js_1.gateHeight + padding * 2;
        // Draw dashed box around children gates
        var box = formatUtils_js_1.dashedBox(x, y, width, height);
        // Display controlled operation in initial "unknown" state
        var svg = formatUtils_js_1.group("<g class=\"" + htmlClass + "-group cls-control-unknown\">", horLine, vertLine, controlCircle, childrenZero, childrenOne, box, '</g>');
        return svg;
    };
    exports._classicalControlled = _classicalControlled;
    /**
     * Generates the SVG representation of the control circle on a classical register with interactivity support
     * for toggling between bit values (unknown, 1, and 0).
     *
     * @param x   x coord.
     * @param y   y coord.
     * @param cls Class name.
     * @param r   Radius of circle.
     *
     * @returns SVG representation of control circle.
     */
    var _controlCircle = function (x, y, cls, r) {
        if (r === void 0) { r = constants_js_1.controlBtnRadius; }
        return "<g class=\"cls-control-btn " + cls + "\" onClick=\"toggleClassicalBtn('" + cls + "')\">\n<circle class=\"" + cls + "\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + r + "\" stroke=\"black\" stroke-width=\"1\"></circle>\n<text class=\"" + cls + " cls-control-text\" font-size=\"" + constants_js_1.labelFontSize + "\" font-family=\"Arial\" x=\"" + x + "\" y=\"" + y + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"black\">?</text>\n</g>";
    };
});
