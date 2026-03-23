#include "DateValidator.h"

DateValidator::DateValidator() {
    // 12 states, start=0, accept={10}
    dfa_ = std::make_unique<DFA>(12, 0, std::set<int>{10});

    // D1: 0-3
    dfa_->addRangeTransition(0, '0', '3', 1);
    dfa_->setDefaultTransition(0, 11);

    // D2: 0-9
    dfa_->addRangeTransition(1, '0', '9', 2);
    dfa_->setDefaultTransition(1, 11);

    // slash1
    dfa_->addTransition(2, '/', 3);
    dfa_->setDefaultTransition(2, 11);

    // M1: 0-1
    dfa_->addRangeTransition(3, '0', '1', 4);
    dfa_->setDefaultTransition(3, 11);

    // M2: 0-9
    dfa_->addRangeTransition(4, '0', '9', 5);
    dfa_->setDefaultTransition(4, 11);

    // slash2
    dfa_->addTransition(5, '/', 6);
    dfa_->setDefaultTransition(5, 11);

    // Y1: 1-9 (no year 0)
    dfa_->addRangeTransition(6, '1', '9', 7);
    dfa_->setDefaultTransition(6, 11);

    // Y2,Y3,Y4: 0-9
    dfa_->addRangeTransition(7, '0', '9', 8);
    dfa_->setDefaultTransition(7, 11);

    dfa_->addRangeTransition(8, '0', '9', 9);
    dfa_->setDefaultTransition(8, 11);

    dfa_->addRangeTransition(9, '0', '9', 10);
    dfa_->setDefaultTransition(9, 11);

    // State 10 is accept, no further input allowed
    dfa_->setDefaultTransition(10, 11);
}

bool DateValidator::calendarCheck(const std::string& input) {
    // input guaranteed to be DD/MM/YYYY at this point
    int dd   = std::stoi(input.substr(0, 2));
    int mm   = std::stoi(input.substr(3, 2));
    int yyyy = std::stoi(input.substr(6, 4));

    if (mm < 1 || mm > 12) return false;
    if (dd < 1)            return false;

    int days_in_month[] = {31,28,31,30,31,30,31,31,30,31,30,31};

    // Leap year check
    bool leap = (yyyy % 4 == 0 && yyyy % 100 != 0) || (yyyy % 400 == 0);
    if (leap) days_in_month[1] = 29;

    return dd <= days_in_month[mm - 1];
}

DFAResult DateValidator::validate(const std::string& input) const {
    DFAResult res = dfa_->simulate(input);
    if (!res.valid) return res;

    // Extra calendar correctness check
    if (!calendarCheck(input)) {
        res.valid         = false;
        res.error_message = "Date '" + input + "' is not a valid calendar date";
        res.error_position = 0;
    }

    return res;
}