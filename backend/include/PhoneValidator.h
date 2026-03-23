#pragma once
#include "Validator.h"

// Accepts international phone numbers:
//   +91 98765 43210   (India with country code)
//   +1 415 555 0172   (US format)
//   9876543210        (10 raw digits)
//   +919876543210     (compact)
//
// DFA states:
//   0  start
//   1  saw '+' (country code mode)
//   2  reading country code digits
//   3  separator (space/-) after country code
//   4  reading subscriber digits  <-- ACCEPT (if >= 7 digits total)
//   5  dead
//
// Note: We use a post-check to verify digit count (7-15 digits per ITU-T E.164)
//
class PhoneValidator : public Validator {
public:
    PhoneValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Phone Number"; }
};