#include "BinaryValidator.h"

// States
// 0  start
// 1  saw '0'  (accept — valid single-digit binary)
// 2  saw '0b' prefix
// 3  reading binary digits after prefix  (accept)
// 4  dead

BinaryValidator::BinaryValidator() {
    // 5 states, start=0, accept={1, 3}
    dfa_ = std::make_unique<DFA>(5, 0, std::set<int>{1, 3});

    // State 0: start
    dfa_->addTransition(0, '0', 1);
    dfa_->addTransition(0, '1', 3);
    dfa_->setDefaultTransition(0, 4);

    // State 1: saw '0' — stay on 0/1, or go to prefix mode on 'b'/'B'
    dfa_->addTransition(1, '0', 1);
    dfa_->addTransition(1, '1', 3);
    dfa_->addTransition(1, 'b', 2);
    dfa_->addTransition(1, 'B', 2);
    dfa_->setDefaultTransition(1, 4);

    // State 2: saw '0b', need at least one binary digit
    dfa_->addTransition(2, '0', 3);
    dfa_->addTransition(2, '1', 3);
    dfa_->setDefaultTransition(2, 4);

    // State 3: reading binary digits (accept, loops)
    dfa_->addTransition(3, '0', 3);
    dfa_->addTransition(3, '1', 3);
    dfa_->setDefaultTransition(3, 4);

    // State 4: dead
}

DFAResult BinaryValidator::validate(const std::string& input) const {
    return dfa_->simulate(input);
}