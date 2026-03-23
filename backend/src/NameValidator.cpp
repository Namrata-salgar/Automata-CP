#include "NameValidator.h"

// States
// 0  start — expects uppercase letter
// 1  inside a word — lowercase or uppercase letters ok (ACCEPT)
// 2  after separator (space/hyphen) — next must be uppercase
// 3  dead

NameValidator::NameValidator() {
    // 4 states, start=0, accept={1}
    dfa_ = std::make_unique<DFA>(4, 0, std::set<int>{1});

    // State 0: must start with uppercase
    dfa_->addRangeTransition(0, 'A', 'Z', 1);
    dfa_->setDefaultTransition(0, 3);

    // State 1: reading word — accept lowercase, uppercase, or separator
    dfa_->addRangeTransition(1, 'a', 'z', 1);
    dfa_->addRangeTransition(1, 'A', 'Z', 1);
    dfa_->addTransition(1, ' ', 2);
    dfa_->addTransition(1, '-', 2);
    dfa_->setDefaultTransition(1, 3);

    // State 2: after separator — next must be uppercase (new word)
    dfa_->addRangeTransition(2, 'A', 'Z', 1);
    dfa_->setDefaultTransition(2, 3);

    // State 3: dead
}

DFAResult NameValidator::validate(const std::string& input) const {
    if (input.empty()) {
        return {false, {0}, 0, "Name cannot be empty"};
    }
    return dfa_->simulate(input);
}