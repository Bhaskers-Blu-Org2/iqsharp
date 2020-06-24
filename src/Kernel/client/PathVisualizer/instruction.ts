import { Register } from "./register";

/**
 * Structure of JSON representation of Q# program.
 */
export interface Program {
    /** Array of qubit resources. */
    qubits: Qubit[];
    instructions: Instruction[];
};

/**
 * Represents a unique qubit resource bit.
 */
export interface Qubit {
    /** Qubit ID. */
    id: number;
    /** Number of classical registers attached to quantum register. */
    numChildren?: number;
};

/**
 * Represents an operation and the registers it acts on.
 */
export interface Instruction {
    /** Gate label. */
    gate: string;
    /** Gate arguments as string. */
    argStr?: string,
    /** Classically-controlled gates.
     *  - children[0]: gates when classical control bit is 0.
     *  - children[1]: gates when classical control bit is 1.
    */
    children?: Instruction[][];
    /** Whether gate is a controlled operation. */
    controlled: boolean;
    /** Whether gate is an adjoint operation. */
    adjoint: boolean;
    /** Control registers the gate acts on. */
    controls: Register[];
    /** Target registers the gate acts on. */
    targets: Register[];
};
