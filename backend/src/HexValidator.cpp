#include "HexValidator.h"

// States
// 0  start
// 1  saw '0'
// 2  saw '0x' / '0X'
// 3  reading hex digits  (ACCEPT)
// 4  dead

HexValidator::HexValidator() {
    // 5 states, start=0, accept={3}
    dfa_ = std::make_unique<DFA>(5, 0, std::set<int>{3});

    // State 0: must start with '0'
    dfa_->addTransition(0, '0', 1);
    dfa_->setDefaultTransition(0, 4);

    // State 1: must see 'x' or 'X'
    dfa_->addTransition(1, 'x', 2);
    dfa_->addTransition(1, 'X', 2);
    dfa_->setDefaultTransition(1, 4);

    // State 2: first hex digit required
    dfa_->addRangeTransition(2, '0', '9', 3);
    dfa_->addRangeTransition(2, 'a', 'f', 3);
    dfa_->addRangeTransition(2, 'A', 'F', 3);
    dfa_->setDefaultTransition(2, 4);

    // State 3: more hex digits (accept, loops)
    dfa_->addRangeTransition(3, '0', '9', 3);
    dfa_->addRangeTransition(3, 'a', 'f', 3);
    dfa_->addRangeTransition(3, 'A', 'F', 3);
    dfa_->setDefaultTransition(3, 4);

    // State 4: dead
}

DFAResult HexValidator::validate(const std::string& input) const {
    return dfa_->simulate(input);
}