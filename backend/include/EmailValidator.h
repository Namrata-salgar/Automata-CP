#pragma once
#include "Validator.h"

// Accepts: local@domain.tld
//
// DFA states:
//   0  start
//   1  reading local part (a-z A-Z 0-9 _ .)
//   2  saw '@'
//   3  reading domain name
//   4  saw '.' after domain
//   5  reading TLD  <-- ACCEPT
//   6  dead/trap
//
class EmailValidator : public Validator {
public:
    EmailValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Email Address"; }
};