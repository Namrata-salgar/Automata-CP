#pragma once
#include "DFA.h"
#include <string>
#include <memory>

class Validator {
public:
    virtual ~Validator() = default;

    // Run validation and return full DFA result
    virtual DFAResult validate(const std::string& input) const = 0;

    // Human-readable name for this format
    virtual std::string name() const = 0;

protected:
    // Subclasses build their DFA in constructor and store it here
    std::unique_ptr<DFA> dfa_;
};