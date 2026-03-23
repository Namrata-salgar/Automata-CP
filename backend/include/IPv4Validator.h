#pragma once
#include "Validator.h"

// Accepts: d.d.d.d  where d = 0-255
// We use a custom simulate (not pure DFA) to check 0-255 range per octet.
//
// DFA states (structural pattern only, range check done separately):
//   0  start
//   1  first octet digit(s)
//   2  first dot
//   3  second octet digit(s)
//   4  second dot
//   5  third octet digit(s)
//   6  third dot
//   7  fourth octet digit(s)  <-- ACCEPT
//   8  dead
//
class IPv4Validator : public Validator {
public:
    IPv4Validator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "IPv4 Address"; }

private:
    // Returns true if s represents a number 0-255
    static bool validOctet(const std::string& s);
};