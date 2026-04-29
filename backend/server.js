const express = require('express');
const cors = require('cors');
const path = require('path');
const validator = require('./validator');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

// GET /health
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Node DFA Validator Backend',
        version: '1.0.0',
        validators: ['email', 'ipv4', 'date', 'binary', 'hex', 'name', 'phone']
    });
});

// GET /formats
app.get('/formats', (req, res) => {
    const formats = [
        {
            key: 'email', label: 'Email Address', pattern: 'local@domain.tld',
            valid_examples: ['user@example.com', 'riya.sharma@college.ac.in', 'test123@gmail.com'],
            invalid_examples: ['@nodomain', 'no-at-sign', 'user@', 'user@domain']
        },
        {
            key: 'ipv4', label: 'IPv4 Address', pattern: '0-255.0-255.0-255.0-255',
            valid_examples: ['192.168.1.1', '0.0.0.0', '255.255.255.255', '10.0.0.1'],
            invalid_examples: ['256.1.1.1', '192.168.1', '1.2.3.4.5', '192.168.01.1']
        },
        {
            key: 'date', label: 'Date (DD/MM/YYYY)', pattern: 'DD/MM/YYYY',
            valid_examples: ['01/01/2024', '31/12/1999', '29/02/2000', '15/08/1947'],
            invalid_examples: ['31/02/2024', '00/13/2024', '2024/01/01', '1/1/24']
        },
        {
            key: 'binary', label: 'Binary Number', pattern: '(0|1)*',
            valid_examples: ['101010', '0', '1', '1101', ''],
            invalid_examples: ['102', '1a0', '0b10', 'abc']
        },
        {
            key: 'hex', label: 'Hexadecimal Number', pattern: '0x[0-9a-fA-F]+',
            valid_examples: ['0x1A3F', '0xFF', '0x0', '0XDeAdBeEf'],
            invalid_examples: ['1A3F', '0x', '0xGG', '0b1010']
        },
        {
            key: 'name', label: 'Full Name', pattern: 'Firstname [Lastname ...]',
            valid_examples: ['Riya Sharma', 'Mary-Jane Watson', 'John', 'A B'],
            invalid_examples: ['riya sharma', 'Riya123', '123', 'Riya ']
        },
        {
            key: 'phone', label: 'Phone Number', pattern: '+CC digits (7-15 digits total)',
            valid_examples: ['+91 98765 43210', '+1 415 555 0172', '9876543210'],
            invalid_examples: ['12345', '+', 'abcdefghij', '+91 123']
        }
    ];
    res.json({ count: formats.length, formats });
});

// POST /validate
app.post('/validate', (req, res) => {
    const { input, format } = req.body;
    
    if (typeof input !== 'string' || typeof format !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'input' or 'format'" });
    }

    if (!input) {
        return res.json({
            valid: false, trace: [], error_position: 0, error_message: "Input is empty"
        });
    }

    try {
        const result = validator.validate(format, input);
        return res.json(result);
    } catch (e) {
        if (e.message.startsWith('Unknown format')) {
            return res.status(400).json({ error: e.message });
        }
        console.error("Validation error:", e);
        return res.status(500).json({ error: "Internal validation error!" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node adapter wrapper running at http://localhost:${PORT}`);
    console.log(`Backend fully initialized. Ready for API requests.`);
});
