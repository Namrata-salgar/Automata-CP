#pragma once
#include "Validator.h"

// Accepts: one or more binary digits (0 or 1), optional 0b prefix
// e.g.  101010  /  0b1101
//
// DFA states:
//   0  start
//   1  saw '0' (could be prefix or binary digit)
//   2  saw 'b' after '0' (0b prefix mode)
//   3  reading binary digits  <-- ACCEPT (also state 1)
//   4  dead
//
class BinaryValidator : public Validator {
public:
    BinaryValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Binary Number"; }
};