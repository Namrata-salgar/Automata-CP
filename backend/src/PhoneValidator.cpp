#include "PhoneValidator.h"
#include <algorithm>

// States
// 0  start
// 1  saw '+' — waiting for country code digit
// 2  reading country code / main digits
// 3  reading after a separator (space or -)
// 4  dead

PhoneValidator::PhoneValidator() {
    // 5 states, start=0, accept={2, 3}
    // Accept states 2 and 3 so we accept both "9876543210" and "+91 98765 43210"
    dfa_ = std::make_unique<DFA>(5, 0, std::set<int>{2, 3});

    // State 0: can start with '+' or digit
    dfa_->addTransition(0, '+', 1);
    dfa_->addRangeTransition(0, '0', '9', 2);
    dfa_->setDefaultTransition(0, 4);

    // State 1: after '+', must get digit
    dfa_->addRangeTransition(1, '0', '9', 2);
    dfa_->setDefaultTransition(1, 4);

    // State 2: reading digits — can continue or hit separator
    dfa_->addRangeTransition(2, '0', '9', 2);
    dfa_->addTransition(2, ' ', 3);
    dfa_->addTransition(2, '-', 3);
    dfa_->setDefaultTransition(2, 4);

    // State 3: after separator — must get digit
    dfa_->addRangeTransition(3, '0', '9', 2);
    dfa_->setDefaultTransition(3, 4);

    // State 4: dead
}

DFAResult PhoneValidator::validate(const std::string& input) const {
    DFAResult res = dfa_->simulate(input);
    if (!res.valid) return res;

    // Count only digits
    int digit_count = (int)std::count_if(input.begin(), input.end(), ::isdigit);

    // ITU-T E.164: 7 to 15 digits
    if (digit_count < 7) {
        res.valid         = false;
        res.error_message = "Phone number too short: " +
                            std::to_string(digit_count) + " digits (minimum 7)";
        res.error_position = (int)input.size() - 1;
    } else if (digit_count > 15) {
        res.valid         = false;
        res.error_message = "Phone number too long: " +
                            std::to_string(digit_count) + " digits (maximum 15)";
        res.error_position = 15;
    }

    return res;
}