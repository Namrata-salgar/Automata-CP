#include "BinaryValidator.h"

// States
// 0 : start & accept (loops on 0 and 1)

BinaryValidator::BinaryValidator() {
    // 1 state, start=0, accept={0}
    dfa_ = std::make_unique<DFA>(1, 0, std::set<int>{0});

    // State 0: loops on 0 and 1
    dfa_->addTransition(0, '0', 0);
    dfa_->addTransition(0, '1', 0);
    
    // No default transition means any other char causes rejection (step returns -1)
}

DFAResult BinaryValidator::validate(const std::string& input) const {
    return dfa_->simulate(input);
}