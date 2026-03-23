#pragma once
#include "Validator.h"

// Accepts: 0x or 0X followed by one or more hex digits (0-9, a-f, A-F)
// e.g.  0x1A3F  /  0XFF  /  0x0
//
// DFA states:
//   0  start
//   1  saw '0'
//   2  saw '0x' or '0X'
//   3  reading hex digits  <-- ACCEPT
//   4  dead
//
class HexValidator : public Validator {
public:
    HexValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Hex Number (0x...)"; }
};