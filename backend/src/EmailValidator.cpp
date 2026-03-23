#include "EmailValidator.h"

// States
// 0 : start
// 1 : local part chars (a-zA-Z0-9_.)
// 2 : saw '@'
// 3 : domain chars (a-zA-Z0-9-)
// 4 : saw '.' after domain
// 5 : TLD chars (a-zA-Z)  <-- ACCEPT
// 6 : dead state

EmailValidator::EmailValidator() {
    // 7 states, start=0, accept={5}
    dfa_ = std::make_unique<DFA>(7, 0, std::set<int>{5});

    // State 0 → State 1 : first char of local part must be alnum
    dfa_->addRangeTransition(0, 'a', 'z', 1);
    dfa_->addRangeTransition(0, 'A', 'Z', 1);
    dfa_->addRangeTransition(0, '0', '9', 1);
    dfa_->setDefaultTransition(0, 6);  // anything else → dead

    // State 1 : more local part chars
    dfa_->addRangeTransition(1, 'a', 'z', 1);
    dfa_->addRangeTransition(1, 'A', 'Z', 1);
    dfa_->addRangeTransition(1, '0', '9', 1);
    dfa_->addTransition(1, '_', 1);
    dfa_->addTransition(1, '.', 1);
    dfa_->addTransition(1, '@', 2);    // local → '@'
    dfa_->setDefaultTransition(1, 6);

    // State 2 : right after '@', must be alnum
    dfa_->addRangeTransition(2, 'a', 'z', 3);
    dfa_->addRangeTransition(2, 'A', 'Z', 3);
    dfa_->addRangeTransition(2, '0', '9', 3);
    dfa_->setDefaultTransition(2, 6);

    // State 3 : domain chars
    dfa_->addRangeTransition(3, 'a', 'z', 3);
    dfa_->addRangeTransition(3, 'A', 'Z', 3);
    dfa_->addRangeTransition(3, '0', '9', 3);
    dfa_->addTransition(3, '-', 3);
    dfa_->addTransition(3, '.', 4);    // domain → '.'
    dfa_->setDefaultTransition(3, 6);

    // State 4 : saw '.', need TLD start
    dfa_->addRangeTransition(4, 'a', 'z', 5);
    dfa_->addRangeTransition(4, 'A', 'Z', 5);
    dfa_->setDefaultTransition(4, 6);

    // State 5 : TLD chars (accept, can loop)
    dfa_->addRangeTransition(5, 'a', 'z', 5);
    dfa_->addRangeTransition(5, 'A', 'Z', 5);
    dfa_->addTransition(5, '.', 4);    // allow sub-TLD e.g. .co.in
    dfa_->setDefaultTransition(5, 6);

    // State 6 : dead — no transitions out
}

DFAResult EmailValidator::validate(const std::string& input) const {
    return dfa_->simulate(input);
}