using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Quantum.Simulation.Core;

#nullable enable

namespace Microsoft.Quantum.IQSharp
{
    public class Circuitizer
    {
        private int currDepth = 0;
        private int renderDepth;
        private IDictionary<int, QubitRegister> qubitRegisters = new Dictionary<int, QubitRegister>();
        private IDictionary<int, List<ClassicalRegister>> classicalRegisters = new Dictionary<int, List<ClassicalRegister>>();
        private List<Instruction> instructions = new List<Instruction>();

        public Circuitizer(int depth = 1) => this.renderDepth = depth + 1;

        public ExecutionPath GetExecutionPath()
        {
            var qubits = this.qubitRegisters.Keys
                .OrderBy(k => k)
                .Select(k =>
                {
                    var qubitDecl = new QubitDeclaration(k);
                    if (this.classicalRegisters.ContainsKey(k))
                    {
                        qubitDecl.numChildren = this.classicalRegisters[k].Count;
                    }

                    return qubitDecl;
                })
                .ToArray();

            return new ExecutionPath(qubits, this.instructions.ToArray());
        }

        public void OnOperationStartHandler(ICallable operation, IApplyData arguments)
        {
            this.currDepth++;
            if (this.currDepth == this.renderDepth)
            {
                var instruction = this.operationToInstruction(operation, arguments);
                if (instruction != null)
                {
                    this.instructions.Add(instruction);
                }
            }
        }

        public void OnOperationEndHandler(ICallable operation, IApplyData result)
        {
            this.currDepth--;
        }

        private QubitRegister getQubitRegister(Qubit qubit)
        {
            if (!this.qubitRegisters.ContainsKey(qubit.Id))
            {
                this.qubitRegisters[qubit.Id] = new QubitRegister(qubit.Id);
            }

            return this.qubitRegisters[qubit.Id];
        }

        private List<QubitRegister> getQubitRegisters(IEnumerable<Qubit> qubits)
        {
            return qubits.Select(this.getQubitRegister).ToList();
        }

        private ClassicalRegister createClassicalRegister(Qubit measureQubit)
        {
            var qId = measureQubit.Id;
            if (!this.classicalRegisters.ContainsKey(qId))
            {
                this.classicalRegisters[qId] = new List<ClassicalRegister>();
            }

            var cId = this.classicalRegisters[qId].Count;
            ClassicalRegister register = new ClassicalRegister(qId, cId);
            this.classicalRegisters[qId].Add(register);
            return register;
        }

        private ClassicalRegister getClassicalRegister(Qubit controlQubit)
        {
            var qId = controlQubit.Id;
            if (!this.classicalRegisters.ContainsKey(qId) || this.classicalRegisters[qId].Count == 0)
            {
                throw new Exception("No classical registers found for qubit {qId}.");
            }

            // Get most recent measurement on given control qubit
            var cId = this.classicalRegisters[qId].Count - 1;
            return this.classicalRegisters[qId][cId];
        }

        private string[] extractArgs(Type t, object value)
        {
            List<string?> fields = new List<string?>();

            foreach (var f in t.GetFields())
            {
                if (f.FieldType.IsTuple())
                {
                    var nestedArgs = f.GetValue(value);
                    if (nestedArgs != null)
                    {
                        var nestedFields = this.extractArgs(f.FieldType, nestedArgs);

                        // Format tuple args as a tuple string
                        var tupleStr = $"({string.Join(",", nestedFields)})";
                        fields.Add(tupleStr);
                    }
                }
                else if (!f.FieldType.IsQubitsContainer())
                {
                    fields.Add(f.GetValue(value)?.ToString());
                }
            }

            return fields.WhereNotNull().ToArray();
        }

        private Instruction? operationToInstruction(ICallable operation, IApplyData arguments)
        {
            var controlled = operation.Variant == OperationFunctor.Controlled ||
                            operation.Variant == OperationFunctor.ControlledAdjoint;
            var adjoint = operation.Variant == OperationFunctor.Adjoint ||
                          operation.Variant == OperationFunctor.ControlledAdjoint;

            if (controlled)
            {
                dynamic ctrlOp = operation;
                dynamic ctrlOpArgs = arguments;

                var ctrls = ctrlOpArgs.Value.Item1;
                var controlRegs = this.getQubitRegisters(ctrls);

                // Recursively get base operation instructions
                var baseOp = ctrlOp.BaseOp;
                var baseArgs = baseOp.__dataIn(ctrlOpArgs.Value.Item2);
                var baseInstr = this.operationToInstruction(baseOp, baseArgs);

                baseInstr.controlled = true;
                baseInstr.adjoint = adjoint;
                baseInstr.controls.InsertRange(0, controlRegs);

                return baseInstr;
            }
            else
            {
                switch (operation)
                {
                    // Handle CNOT operations as a Controlled X
                    case Microsoft.Quantum.Intrinsic.CNOT cnot:
                    case Microsoft.Quantum.Intrinsic.CCNOT ccnot:
                        var ctrlRegs = new List<Register>();
                        var targetRegs = new List<Register>();

                        switch (arguments.Value)
                        {
                            case ValueTuple<Qubit, Qubit> cnotQs:
                                var (ctrl, cnotTarget) = cnotQs;
                                ctrlRegs.Add(this.getQubitRegister(ctrl));
                                targetRegs.Add(this.getQubitRegister(cnotTarget));
                                break;
                            case ValueTuple<Qubit, Qubit, Qubit> ccnotQs:
                                var (ctrl1, ctrl2, ccnotTarget) = ccnotQs;
                                ctrlRegs.Add(this.getQubitRegister(ctrl1));
                                ctrlRegs.Add(this.getQubitRegister(ctrl2));
                                targetRegs.Add(this.getQubitRegister(ccnotTarget));
                                break;
                        }

                        return new Instruction
                        {
                            gate = "X",
                            controlled = true,
                            adjoint = adjoint,
                            controls = ctrlRegs,
                            targets = targetRegs,
                        };

                    // Measurement operation
                    case Microsoft.Quantum.Intrinsic.M m:
                        var measureQubit = arguments.GetQubits().ElementAt(0);
                        var measureReg = this.getQubitRegister(measureQubit);
                        var clsReg = this.createClassicalRegister(measureQubit);

                        return new Instruction
                        {
                            gate = "measure",
                            controlled = false,
                            adjoint = adjoint,
                            controls = new List<Register>() { measureReg },
                            targets = new List<Register>() { clsReg },
                        };

                    // Operations to ignore
                    case Microsoft.Quantum.Intrinsic.Reset reset:
                    case Microsoft.Quantum.Intrinsic.ResetAll resetAll:
                        return null;

                    // General operations
                    default:
                        Type t = arguments.Value.GetType();
                        var fields = this.extractArgs(t, arguments.Value);
                        var argStr = fields.Any() ? $"({string.Join(",", fields)})" : null;
                        var qubitRegs = this.getQubitRegisters(arguments.GetQubits());

                        return new Instruction
                        {
                            gate = operation.Name,
                            argStr = argStr,
                            controlled = false,
                            adjoint = adjoint,
                            controls = new List<Register>(),
                            targets = qubitRegs.Cast<Register>().ToList(),
                        };
                }
            }
        }
    }
}