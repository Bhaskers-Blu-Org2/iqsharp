define(["require", "exports", "./formatters/inputFormatter", "./formatters/gateFormatter", "./formatters/registerFormatter", "./process", "./constants"], function (require, exports, inputFormatter_1, gateFormatter_1, registerFormatter_1, process_1, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var script = "\n<script type=\"text/JavaScript\">\n    function toggleClassicalBtn(cls) {\n        const textSvg = document.querySelector(`.${cls} text`);\n        const group = document.querySelector(`.${cls}-group`);\n        const currValue = textSvg.childNodes[0].nodeValue;\n        const zeroGates = document.querySelector(`.${cls}-zero`);\n        const oneGates = document.querySelector(`.${cls}-one`);\n        switch (currValue) {\n            case '?':\n                textSvg.childNodes[0].nodeValue = '1';\n                group.classList.remove('cls-control-unknown');\n                group.classList.add('cls-control-one');\n                break;\n            case '1':\n                textSvg.childNodes[0].nodeValue = '0';\n                group.classList.remove('cls-control-one');\n                group.classList.add('cls-control-zero');\n                oneGates.classList.toggle('hidden');\n                zeroGates.classList.toggle('hidden');\n                break;\n            case '0':\n                textSvg.childNodes[0].nodeValue = '?';\n                group.classList.remove('cls-control-zero');\n                group.classList.add('cls-control-unknown');\n                zeroGates.classList.toggle('hidden');\n                oneGates.classList.toggle('hidden');\n                break;\n        }\n    }\n</script>\n";
    var style = "\n<style>\n    .hidden {\n        display: none;\n    }\n    .cls-control-unknown {\n        opacity: 0.25;\n    }\n    <!-- Gate outline -->\n    .cls-control-one rect,\n    .cls-control-one line,\n    .cls-control-one circle {\n        stroke: #4059bd;\n        stroke-width: 1.3;\n    }\n    .cls-control-zero rect,\n    .cls-control-zero line,\n    .cls-control-zero circle {\n        stroke: #c40000;\n        stroke-width: 1.3;\n    }\n    <!-- Gate label -->\n    .cls-control-one text {\n        fill: #4059bd;\n    }\n    .cls-control-zero text {\n        fill: #c40000;\n    }\n    <!-- Control button -->\n    .cls-control-btn {\n        cursor: pointer;\n    }\n    .cls-control-unknown .cls-control-btn {\n        fill: #e5e5e5;\n    }\n    .cls-control-one .cls-control-btn {\n        fill: #4059bd;\n    }\n    .cls-control-zero .cls-control-btn {\n        fill: #c40000;\n    }\n    <!-- Control button text -->\n    .cls-control-unknown .cls-control-text {\n        fill: black;\n        stroke: none;\n    }\n    .cls-control-one .cls-control-text,\n    .cls-control-zero .cls-control-text {\n        fill: white;\n        stroke: none;\n    }\n</style>\n";
    /**
     * Converts JSON representing a circuit from the simulator and returns its SVG representation.
     *
     * @param json JSON received from simulator.
     *
     * @returns SVG representation of circuit.
     */
    var jsonToSvg = function (json) {
        var qubits = json.qubits, instructions = json.instructions;
        var _a = inputFormatter_1.formatInputs(qubits), qubitWires = _a.qubitWires, registers = _a.registers, svgHeight = _a.svgHeight;
        var _b = process_1.processInstructions(instructions, registers), metadataList = _b.metadataList, svgWidth = _b.svgWidth;
        var formattedGates = gateFormatter_1.formatGates(metadataList);
        var measureGates = metadataList.filter(function (_a) {
            var type = _a.type;
            return type === constants_1.GateType.Measure;
        });
        var formattedRegs = registerFormatter_1.formatRegisters(registers, measureGates, svgWidth);
        var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"" + svgWidth + "\" height=\"" + svgHeight + "\">";
        svg += script;
        svg += style;
        svg += qubitWires;
        svg += formattedRegs;
        svg += formattedGates;
        svg += '</svg>';
        return svg;
    };
    var jsonToHtml = function (json) {
        var svg = jsonToSvg(json);
        return '<html>\r\n' + svg + '</html>';
    };
    console.log("SVG_CIRC");
    module.exports = {
        jsonToSvg: jsonToSvg,
        jsonToHtml: jsonToHtml,
    };
});
