var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "./constants.js", "./register.js", "./utils.js"], function (require, exports, constants_js_1, register_js_1, utils_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Takes in a list of instructions and maps them to `metadata` objects which
     * contains information for formatting the corresponding SVG.
     *
     * @param instructions Array of instruction objects.
     * @param registers    Array of registers.
     *
     * @returns An object containing `metadataList` (Array of Metadata objects) and
     *          `svgWidth` which is the width of the entire SVG.
     */
    var processInstructions = function (instructions, registers) {
        // Group instructions based on registers
        var groupedOps = _groupOperations(instructions, registers);
        // Align operations on multiple registers
        var alignedOps = _alignOps(groupedOps);
        // Maintain widths of each column to account for variable-sized gates
        var numColumns = Math.max.apply(Math, alignedOps.map(function (ops) { return ops.length; }));
        var columnsWidths = new Array(numColumns).fill(constants_js_1.minGateWidth);
        // Keep track of which ops are already seen to avoid duplicate rendering
        var visited = {};
        // Unique HTML class for each classically-controlled group of gates.
        var cls = 1;
        // Map instruction index to gate metadata for formatting later
        var opsMetadata = alignedOps.map(function (regOps) {
            return regOps.map(function (opIdx, col) {
                var op = null;
                if (opIdx != null && !visited.hasOwnProperty(opIdx)) {
                    op = instructions[opIdx];
                    visited[opIdx] = true;
                }
                var metadata = _opToMetadata(op, registers);
                // Add HTML class attribute if classically controlled
                if (metadata.type === constants_js_1.GateType.ClassicalControlled) {
                    _addClass(metadata, "cls-control-" + cls++);
                }
                // Expand column size, if needed
                if (metadata.width > columnsWidths[col]) {
                    columnsWidths[col] = metadata.width;
                }
                return metadata;
            });
        });
        // Fill in x coord of each gate
        var endX = _fillMetadataX(opsMetadata, columnsWidths);
        // Flatten operations and filter out null gates
        var metadataList = opsMetadata.flat().filter(function (_a) {
            var type = _a.type;
            return type != constants_js_1.GateType.Null;
        });
        return { metadataList: metadataList, svgWidth: endX };
    };
    exports.processInstructions = processInstructions;
    /**
     * Group gates provided by instructions into their respective registers.
     *
     * @param instructions Array of instruction objects.
     * @param numRegs      Total number of registers.
     *
     * @returns 2D array of indices where `groupedOps[i][j]` is the index of the instruction
     *          at register `i` and column `j` (not yet aligned/padded).
     */
    var _groupOperations = function (instructions, registers) {
        // NOTE: We get the max ID instead of just number of keys because there can be a qubit ID that
        // isn't acted upon and thus does not show up as a key in registers.
        var numRegs = Math.max.apply(Math, Object.keys(registers).map(Number)) + 1;
        var groupedOps = Array.from(Array(numRegs), function () { return new Array(0); });
        instructions.forEach(function (_a, instrIdx) {
            var targets = _a.targets, controls = _a.controls;
            var qRegs = __spreadArrays(controls, targets).filter(function (_a) {
                var type = _a.type;
                return type === register_js_1.RegisterType.Qubit;
            });
            var qRegIdxList = qRegs.map(function (_a) {
                var qId = _a.qId;
                return qId;
            });
            var clsControls = controls.filter(function (_a) {
                var type = _a.type;
                return type === register_js_1.RegisterType.Classical;
            });
            var isClassicallyControlled = clsControls.length > 0;
            // If operation is classically-controlled, pad all qubit registers. Otherwise, only pad
            // the contiguous range of registers that it covers.
            var minRegIdx = (isClassicallyControlled) ? 0 : Math.min.apply(Math, qRegIdxList);
            var maxRegIdx = (isClassicallyControlled) ? numRegs - 1 : Math.max.apply(Math, qRegIdxList);
            // Add operation also to registers that are in-between target registers
            // so that other gates won't render in the middle.
            for (var i = minRegIdx; i <= maxRegIdx; i++) {
                groupedOps[i].push(instrIdx);
            }
        });
        return groupedOps;
    };
    exports._groupOperations = _groupOperations;
    /**
     * Aligns operations by padding registers with `null`s to make sure that multiqubit
     * gates are in the same column.
     * e.g. ---[x]---[x]--
     *      ----------|---
     *
     * @param ops 2D array of operations. Each row represents a register
     *            and the operations acting on it (in-order).
     *
     * @returns 2D array of aligned operations padded with `null`s.
     */
    var _alignOps = function (ops) {
        var maxNumOps = Math.max.apply(Math, ops.map(function (regOps) { return regOps.length; }));
        var col = 0;
        // Deep copy ops to be returned as paddedOps
        var paddedOps = JSON.parse(JSON.stringify(ops));
        while (col < maxNumOps) {
            var _loop_1 = function (regIdx) {
                var reg = paddedOps[regIdx];
                if (reg.length <= col)
                    return "continue";
                // Should never be null (nulls are only padded to previous columns)
                var opIdx = reg[col];
                // Get position of gate
                var targetsPos = paddedOps.map(function (regOps) { return regOps.indexOf(opIdx); });
                var gatePos = Math.max.apply(Math, targetsPos);
                // If current column is not desired gate position, pad with null
                if (col < gatePos) {
                    paddedOps[regIdx].splice(col, 0, null);
                    maxNumOps = Math.max(maxNumOps, paddedOps[regIdx].length);
                }
            };
            for (var regIdx = 0; regIdx < paddedOps.length; regIdx++) {
                _loop_1(regIdx);
            }
            col++;
        }
        return paddedOps;
    };
    exports._alignOps = _alignOps;
    /**
     * Given an array of column widths, calculate the middle x coord of each column.
     * This will be used to centre the gates within each column.
     *
     * @param columnWidths Array of column widths where `columnWidths[i]` is the
     *                     width of the `i`th column.
     *
     * @returns Object containing the middle x coords of each column (`columnsX`) and the width
     * of the corresponding SVG (`svgWidth`).
     */
    var _getColumnsX = function (columnWidths) {
        var columnsX = new Array(columnWidths.length).fill(0);
        var x = constants_js_1.startX;
        for (var i = 0; i < columnWidths.length; i++) {
            var width = columnWidths[i];
            columnsX[i] = x + width / 2;
            x += width + constants_js_1.gatePadding * 2;
        }
        return { columnsX: columnsX, svgWidth: x };
    };
    exports._getColumnsX = _getColumnsX;
    /**
     * Maps operation to metadata (e.g. gate type, position, dimensions, text)
     * required to render the image.
     *
     * @param op        Operation to be mapped into metadata format.
     * @param registers Array of registers.
     *
     * @returns Metadata representation of given operation.
     */
    var _opToMetadata = function (op, registers) {
        var metadata = {
            type: constants_js_1.GateType.Null,
            x: 0,
            controlsY: [],
            targetsY: [],
            label: '',
            width: constants_js_1.minGateWidth,
        };
        if (op == null)
            return metadata;
        var gate = op.gate, argStr = op.argStr, controlled = op.controlled, adjoint = op.adjoint, controls = op.controls, targets = op.targets, children = op.children;
        // Set y coords
        metadata.controlsY = controls.map(function (reg) { return _getRegY(reg, registers); });
        metadata.targetsY = targets.map(function (reg) { return _getRegY(reg, registers); });
        if (children != null) {
            // Classically-controlled operations
            // Gates to display when classical bit is 0.
            var childrenInstrs = processInstructions(children[0], registers);
            var zeroGates = childrenInstrs.metadataList;
            var zeroChildWidth = childrenInstrs.svgWidth;
            // Gates to display when classical bit is 1.
            childrenInstrs = processInstructions(children[1], registers);
            var oneGates = childrenInstrs.metadataList;
            var oneChildWidth = childrenInstrs.svgWidth;
            // Subtract startX (left-side) and 2*gatePadding (right-side) from nested child gates width
            var width = Math.max(zeroChildWidth, oneChildWidth) - constants_js_1.startX - constants_js_1.gatePadding * 2;
            metadata.type = constants_js_1.GateType.ClassicalControlled;
            metadata.children = [zeroGates, oneGates];
            // Add additional width from control button and inner box padding for dashed box
            metadata.width = width + constants_js_1.controlBtnOffset + constants_js_1.classicalBoxPadding * 2;
            // Set targets to first and last quantum registers so we can render the surrounding box
            // around all quantum registers.
            var qubitsY = Object.values(registers).map(function (_a) {
                var y = _a.y;
                return y;
            });
            metadata.targetsY = [Math.min.apply(Math, qubitsY), Math.max.apply(Math, qubitsY)];
        }
        else if (gate === 'measure') {
            metadata.type = constants_js_1.GateType.Measure;
        }
        else if (gate === 'SWAP') {
            metadata.type = constants_js_1.GateType.Swap;
        }
        else if (controlled) {
            metadata.type = (gate === 'X') ? constants_js_1.GateType.Cnot : constants_js_1.GateType.ControlledUnitary;
            metadata.label = gate;
        }
        else {
            // Any other gate treated as a simple unitary gate
            metadata.type = constants_js_1.GateType.Unitary;
            metadata.label = gate;
            if (argStr != null)
                metadata.argStr = argStr;
        }
        // If adjoint, add ' to the end of gate label
        if (adjoint && metadata.label.length > 0)
            metadata.label += "'";
        // Set gate width
        metadata.width = utils_js_1.getGateWidth(metadata);
        return metadata;
    };
    exports._opToMetadata = _opToMetadata;
    /**
     * Compute the y coord of a given register.
     *
     * @param reg       Register to compute y coord of.
     * @param registers Map of qubit IDs to RegisterMetadata.
     *
     * @returns The y coord of give register.
     */
    var _getRegY = function (reg, registers) {
        var type = reg.type, qId = reg.qId, cId = reg.cId;
        if (!registers.hasOwnProperty(qId))
            throw new Error("ERROR: Qubit register with ID " + qId + " not found.");
        var _a = registers[qId], y = _a.y, children = _a.children;
        switch (type) {
            case register_js_1.RegisterType.Qubit:
                return y;
            case register_js_1.RegisterType.Classical:
                if (children == null)
                    throw new Error("ERROR: No classical registers found for qubit ID " + qId + ".");
                if (cId == null)
                    throw new Error("ERROR: No ID defined for classical register associated with qubit ID " + qId + ".");
                if (children.length <= cId)
                    throw new Error("ERROR: Classical register ID " + cId + " invalid for qubit ID " + qId + " with " + children.length + " classical register(s).");
                return children[cId].y;
            default:
                throw new Error("ERROR: Unknown register type " + type + ".");
        }
    };
    exports._getRegY = _getRegY;
    /**
     * Adds HTML class to metadata and its nested children.
     *
     * @param metadata Metadata assigned to class.
     * @param cls      HTML class name.
     */
    var _addClass = function (metadata, cls) {
        metadata.htmlClass = cls;
        if (metadata.children != null) {
            metadata.children[0].forEach(function (child) { return _addClass(child, cls); });
            metadata.children[1].forEach(function (child) { return _addClass(child, cls); });
        }
    };
    exports._addClass = _addClass;
    /**
     * Updates the x coord of each metadata in the given 2D array of metadata and returns rightmost x coord.
     *
     * @param opsMetadata  2D array of metadata.
     * @param columnWidths Array of column widths.
     *
     * @returns Rightmost x coord.
     */
    var _fillMetadataX = function (opsMetadata, columnWidths) {
        var currX = constants_js_1.startX;
        var colStartX = columnWidths.map(function (width) {
            var x = currX;
            currX += width + constants_js_1.gatePadding * 2;
            return x;
        });
        var endX = currX;
        opsMetadata.forEach(function (regOps) { return regOps.forEach(function (metadata, col) {
            var x = colStartX[col];
            if (metadata.type === constants_js_1.GateType.ClassicalControlled) {
                // Subtract startX offset from nested gates and add offset and padding
                var offset = x - constants_js_1.startX + constants_js_1.controlBtnOffset + constants_js_1.classicalBoxPadding;
                // Offset each x coord in children gates
                _offsetChildrenX(metadata.children, offset);
                // We don't use the centre x coord because we only care about the rightmost x for
                // rendering the box around the group of nested gates
                metadata.x = x;
            }
            else {
                // Get x coord of middle of each column (used for centering gates in a column)
                metadata.x = x + columnWidths[col] / 2;
            }
        }); });
        return endX;
    };
    exports._fillMetadataX = _fillMetadataX;
    /**
     * Offset x coords of nested children operations.
     *
     * @param children 2D array of children metadata.
     * @param offset   x coord offset.
     */
    var _offsetChildrenX = function (children, offset) {
        if (children == null)
            return;
        children.flat().forEach(function (child) {
            child.x += offset;
            _offsetChildrenX(child.children, offset);
        });
    };
    exports._offsetChildrenX = _offsetChildrenX;
});
