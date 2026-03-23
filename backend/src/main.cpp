#include "ValidatorFactory.h"
#include <iostream>
#include <string>

// CLI interface:
// Usage: validator.exe <format> <input>
int main(int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "Usage: validator <format> <input>\n";
        return 1;
    }

    std::string format = argv[1];
    std::string input = argv[2];

    ValidatorFactory factory;
    const Validator* validator = factory.get(format);
    
    if (!validator) {
        std::cout << "{\"error\":\"Unknown format\"}\n";
        return 2;
    }

    if (input.empty()) {
        std::cout << "{\"valid\":false,\"trace\":[],\"error_position\":0,\"error_message\":\"Input is empty\"}\n";
        return 0;
    }

    DFAResult result = validator->validate(input);

    // Manual JSON serialization to avoid json.hpp dependency on old compiler
    std::cout << "{";
    std::cout << "\"valid\":" << (result.valid ? "true" : "false") << ",";
    std::cout << "\"trace\":[";
    for (size_t i = 0; i < result.trace.size(); ++i) {
        std::cout << result.trace[i];
        if (i < result.trace.size() - 1) std::cout << ",";
    }
    std::cout << "],";
    std::cout << "\"error_position\":" << result.error_position << ",";
    
    // escape string for json
    std::string escaped_msg;
    for (char c : result.error_message) {
        if (c == '"') escaped_msg += "\\\"";
        else if (c == '\\') escaped_msg += "\\\\";
        else if (c == '\n') escaped_msg += "\\n";
        else escaped_msg += c;
    }
    
    std::cout << "\"error_message\":\"" << escaped_msg << "\"";
    std::cout << "}\n";

    return 0;
}