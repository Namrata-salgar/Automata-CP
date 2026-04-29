/**
 * DFA-based validation engine ported from C++
 */

class DFA {
    constructor(numStates, startState, acceptStates) {
        this.numStates = numStates;
        this.startState = startState;
        this.acceptStates = new Set(acceptStates);
        this.transitions = Array.from({ length: numStates }, () => ({}));
        this.defaults = Array(numStates).fill(-1);
    }

    addTransition(from, char, to) {
        if (from < 0 || from >= this.numStates) return;
        this.transitions[from][char] = to;
    }

    addRangeTransition(from, lo, hi, to) {
        const loCode = lo.charCodeAt(0);
        const hiCode = hi.charCodeAt(0);
        for (let i = loCode; i <= hiCode; i++) {
            this.addTransition(from, String.fromCharCode(i), to);
        }
    }

    setDefaultTransition(from, to) {
        if (from < 0 || from >= this.numStates) return;
        this.defaults[from] = to;
    }

    step(state, char) {
        if (state < 0 || state >= this.numStates) return -1;
        if (char in this.transitions[state]) {
            return this.transitions[state][char];
        }
        return this.defaults[state];
    }

    simulate(input) {
        let current = this.startState;
        const trace = [current];

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            const next = this.step(current, char);

            if (next === -1 || next === 8 && this.numStates === 9) { // Special case for IPv4 dead state
                // Handling dead states generically
            }

            // In our C++ implementation, 'dead' state (like 6 in Email, 8 in IPv4) 
            // is just a state with no transitions out (or all looping to itself).
            // We follow the trace exactly as C++ would.
            
            current = next;
            trace.push_back ? trace.push(current) : trace.push(current);

            if (current === -1) {
                return {
                    valid: false,
                    trace,
                    error_position: i,
                    error_message: `Unexpected character '${char}' at position ${i}`
                };
            }
        }

        const valid = this.acceptStates.has(current);
        return {
            valid,
            trace,
            error_position: valid ? -1 : input.length,
            error_message: valid ? "" : "Input ended in non-accepting state"
        };
    }
}

// ─── Validators ──────────────────────────────────────────────────

const createEmailValidator = () => {
    const dfa = new DFA(7, 0, [5]);
    dfa.addRangeTransition(0, 'a', 'z', 1);
    dfa.addRangeTransition(0, 'A', 'Z', 1);
    dfa.addRangeTransition(0, '0', '9', 1);
    dfa.setDefaultTransition(0, 6);

    dfa.addRangeTransition(1, 'a', 'z', 1);
    dfa.addRangeTransition(1, 'A', 'Z', 1);
    dfa.addRangeTransition(1, '0', '9', 1);
    dfa.addTransition(1, '_', 1);
    dfa.addTransition(1, '.', 1);
    dfa.addTransition(1, '@', 2);
    dfa.setDefaultTransition(1, 6);

    dfa.addRangeTransition(2, 'a', 'z', 3);
    dfa.addRangeTransition(2, 'A', 'Z', 3);
    dfa.addRangeTransition(2, '0', '9', 3);
    dfa.setDefaultTransition(2, 6);

    dfa.addRangeTransition(3, 'a', 'z', 3);
    dfa.addRangeTransition(3, 'A', 'Z', 3);
    dfa.addRangeTransition(3, '0', '9', 3);
    dfa.addTransition(3, '-', 3);
    dfa.addTransition(3, '.', 4);
    dfa.setDefaultTransition(3, 6);

    dfa.addRangeTransition(4, 'a', 'z', 5);
    dfa.addRangeTransition(4, 'A', 'Z', 5);
    dfa.setDefaultTransition(4, 6);

    dfa.addRangeTransition(5, 'a', 'z', 5);
    dfa.addRangeTransition(5, 'A', 'Z', 5);
    dfa.addTransition(5, '.', 4);
    dfa.setDefaultTransition(5, 6);

    dfa.setDefaultTransition(6, 6);
    
    return {
        validate: (input) => dfa.simulate(input)
    };
};

const createIPv4Validator = () => {
    const dfa = new DFA(9, 0, [7]);
    
    // octet 1
    dfa.addRangeTransition(0, '0', '9', 1);
    dfa.addRangeTransition(1, '0', '9', 1);
    dfa.addTransition(1, '.', 2);
    dfa.setDefaultTransition(0, 8);
    dfa.setDefaultTransition(1, 8);

    // octet 2
    dfa.addRangeTransition(2, '0', '9', 3);
    dfa.addRangeTransition(3, '0', '9', 3);
    dfa.addTransition(3, '.', 4);
    dfa.setDefaultTransition(2, 8);
    dfa.setDefaultTransition(3, 8);

    // octet 3
    dfa.addRangeTransition(4, '0', '9', 5);
    dfa.addRangeTransition(5, '0', '9', 5);
    dfa.addTransition(5, '.', 6);
    dfa.setDefaultTransition(4, 8);
    dfa.setDefaultTransition(5, 8);

    // octet 4
    dfa.addRangeTransition(6, '0', '9', 7);
    dfa.addRangeTransition(7, '0', '9', 7);
    dfa.setDefaultTransition(6, 8);
    dfa.setDefaultTransition(7, 8);

    dfa.setDefaultTransition(8, 8);

    const validOctet = (s) => {
        if (!s || s.length > 3) return false;
        if (s.length > 1 && s[0] === '0') return false;
        const val = parseInt(s, 10);
        return val >= 0 && val <= 255;
    };

    return {
        validate: (input) => {
            const res = dfa.simulate(input);
            if (!res.valid) return res;

            const octets = input.split('.');
            let pos = 0;
            for (const octet of octets) {
                if (!validOctet(octet)) {
                    return {
                        valid: false,
                        trace: res.trace,
                        error_position: pos,
                        error_message: `Octet '${octet}' is out of range 0-255`
                    };
                }
                pos += octet.length + 1;
            }
            return res;
        }
    };
};

const createDateValidator = () => {
    const dfa = new DFA(12, 0, [10]);
    dfa.addRangeTransition(0, '0', '3', 1); dfa.setDefaultTransition(0, 11);
    dfa.addRangeTransition(1, '0', '9', 2); dfa.setDefaultTransition(1, 11);
    dfa.addTransition(2, '/', 3); dfa.setDefaultTransition(2, 11);
    dfa.addRangeTransition(3, '0', '1', 4); dfa.setDefaultTransition(3, 11);
    dfa.addRangeTransition(4, '0', '9', 5); dfa.setDefaultTransition(4, 11);
    dfa.addTransition(5, '/', 6); dfa.setDefaultTransition(5, 11);
    dfa.addRangeTransition(6, '1', '9', 7); dfa.setDefaultTransition(6, 11);
    dfa.addRangeTransition(7, '0', '9', 8); dfa.setDefaultTransition(7, 11);
    dfa.addRangeTransition(8, '0', '9', 9); dfa.setDefaultTransition(8, 11);
    dfa.addRangeTransition(9, '0', '9', 10); dfa.setDefaultTransition(9, 11);
    dfa.setDefaultTransition(10, 11);
    dfa.setDefaultTransition(11, 11);

    const calendarCheck = (input) => {
        const dd = parseInt(input.substring(0, 2), 10);
        const mm = parseInt(input.substring(3, 5), 10);
        const yyyy = parseInt(input.substring(6, 10), 10);

        if (mm < 1 || mm > 12) return false;
        if (dd < 1) return false;

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const isLeap = (yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0);
        if (isLeap) daysInMonth[1] = 29;

        return dd <= daysInMonth[mm - 1];
    };

    return {
        validate: (input) => {
            const res = dfa.simulate(input);
            if (!res.valid) return res;
            if (!calendarCheck(input)) {
                return {
                    valid: false,
                    trace: res.trace,
                    error_position: 0,
                    error_message: `Date '${input}' is not a valid calendar date`
                };
            }
            return res;
        }
    };
};

const createBinaryValidator = () => {
    const dfa = new DFA(1, 0, [0]);
    dfa.addTransition(0, '0', 0);
    dfa.addTransition(0, '1', 0);
    return { validate: (input) => dfa.simulate(input) };
};

const createHexValidator = () => {
    const dfa = new DFA(5, 0, [3]);
    dfa.addTransition(0, '0', 1);
    dfa.setDefaultTransition(0, 4);

    dfa.addTransition(1, 'x', 2);
    dfa.addTransition(1, 'X', 2);
    dfa.setDefaultTransition(1, 4);

    dfa.addRangeTransition(2, '0', '9', 3);
    dfa.addRangeTransition(2, 'a', 'f', 3);
    dfa.addRangeTransition(2, 'A', 'F', 3);
    dfa.setDefaultTransition(2, 4);

    dfa.addRangeTransition(3, '0', '9', 3);
    dfa.addRangeTransition(3, 'a', 'f', 3);
    dfa.addRangeTransition(3, 'A', 'F', 3);
    dfa.setDefaultTransition(3, 4);

    dfa.setDefaultTransition(4, 4);

    return { validate: (input) => dfa.simulate(input) };
};

const createNameValidator = () => {
    const dfa = new DFA(4, 0, [1]);
    dfa.addRangeTransition(0, 'A', 'Z', 1);
    dfa.setDefaultTransition(0, 3);

    dfa.addRangeTransition(1, 'a', 'z', 1);
    dfa.addRangeTransition(1, 'A', 'Z', 1);
    dfa.addTransition(1, ' ', 2);
    dfa.addTransition(1, '-', 2);
    dfa.setDefaultTransition(1, 3);

    dfa.addRangeTransition(2, 'A', 'Z', 1);
    dfa.setDefaultTransition(2, 3);

    dfa.setDefaultTransition(3, 3);

    return {
        validate: (input) => {
            if (!input) return { valid: false, trace: [0], error_position: 0, error_message: "Name cannot be empty" };
            return dfa.simulate(input);
        }
    };
};

const createPhoneValidator = () => {
    const dfa = new DFA(5, 0, [2, 3]);
    dfa.addTransition(0, '+', 1);
    dfa.addRangeTransition(0, '0', '9', 2);
    dfa.setDefaultTransition(0, 4);

    dfa.addRangeTransition(1, '0', '9', 2);
    dfa.setDefaultTransition(1, 4);

    dfa.addRangeTransition(2, '0', '9', 2);
    dfa.addTransition(2, ' ', 3);
    dfa.addTransition(2, '-', 3);
    dfa.setDefaultTransition(2, 4);

    dfa.addRangeTransition(3, '0', '9', 2);
    dfa.setDefaultTransition(3, 4);

    dfa.setDefaultTransition(4, 4);

    return {
        validate: (input) => {
            const res = dfa.simulate(input);
            if (!res.valid) return res;

            const digitCount = input.replace(/\D/g, '').length;
            if (digitCount < 7) {
                return {
                    valid: false,
                    trace: res.trace,
                    error_position: input.length - 1,
                    error_message: `Phone number too short: ${digitCount} digits (minimum 7)`
                };
            } else if (digitCount > 15) {
                return {
                    valid: false,
                    trace: res.trace,
                    error_position: 15,
                    error_message: `Phone number too long: ${digitCount} digits (maximum 15)`
                };
            }
            return res;
        }
    };
};




const validators = {
    email: createEmailValidator(),
    ipv4: createIPv4Validator(),
    date: createDateValidator(),
    binary: createBinaryValidator(),
    hex: createHexValidator(),
    name: createNameValidator(),
    phone: createPhoneValidator()
};

module.exports = {
    validate: (format, input) => {
        if (!validators[format]) {
            throw new Error(`Unknown format: ${format}`);
        }
        return validators[format].validate(input);
    }
};
