#pragma once
#include "Validator.h"

// Accepts: full names like "Riya Sharma", "Mary-Jane Watson"
// Rules:
//   - Must start with uppercase letter
//   - Can contain letters (a-z A-Z), spaces, hyphens
//   - No digits, no special chars, no leading/trailing space
//   - Each word must start with uppercase (first letter of each segment)
//
// DFA states:
//   0  start
//   1  reading a name word (after uppercase start)   <-- ACCEPT
//   2  saw space or hyphen (separator)
//   3  dead
//
class NameValidator : public Validator {
public:
    NameValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Full Name"; }
};