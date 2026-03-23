#pragma once
#include "Validator.h"

// Accepts: DD/MM/YYYY
//
// DFA states:
//   0  start
//   1  D1  (0-3)
//   2  D2  (0-9)
//   3  slash1
//   4  M1  (0-1)
//   5  M2  (0-9)
//   6  slash2
//   7  Y1  (1-9)
//   8  Y2  (0-9)
//   9  Y3  (0-9)
//  10  Y4  (0-9)  <-- ACCEPT
//  11  dead
//
class DateValidator : public Validator {
public:
    DateValidator();
    DFAResult validate(const std::string& input) const override;
    std::string name() const override { return "Date (DD/MM/YYYY)"; }

private:
    static bool calendarCheck(const std::string& input);
};