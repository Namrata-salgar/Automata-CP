#include "IPv4Validator.h"
#include <sstream>

// States
// 0  start
// 1  reading octet 1
// 2  dot after octet 1
// 3  reading octet 2
// 4  dot after octet 2
// 5  reading octet 3
// 6  dot after octet 3
// 7  reading octet 4  <-- ACCEPT
// 8  dead

IPv4Validator::IPv4Validator() {
    dfa_ = std::make_unique<DFA>(9, 0, std::set<int>{7});

    auto addOctetState = [&](int from, int self, int dotTo) {
        dfa_->addRangeTransition(from, '0', '9', self);
        dfa_->addRangeTransition(self, '0', '9', self);
        if (dotTo >= 0)
            dfa_->addTransition(self, '.', dotTo);
        dfa_->setDefaultTransition(from, 8);
        dfa_->setDefaultTransition(self, 8);
    };

    // octet 1: states 0→1, dot→2
    dfa_->addRangeTransition(0, '0', '9', 1);
    dfa_->addRangeTransition(1, '0', '9', 1);
    dfa_->addTransition(1, '.', 2);
    dfa_->setDefaultTransition(0, 8);
    dfa_->setDefaultTransition(1, 8);

    // octet 2: states 2→3, dot→4
    dfa_->addRangeTransition(2, '0', '9', 3);
    dfa_->addRangeTransition(3, '0', '9', 3);
    dfa_->addTransition(3, '.', 4);
    dfa_->setDefaultTransition(2, 8);
    dfa_->setDefaultTransition(3, 8);

    // octet 3: states 4→5, dot→6
    dfa_->addRangeTransition(4, '0', '9', 5);
    dfa_->addRangeTransition(5, '0', '9', 5);
    dfa_->addTransition(5, '.', 6);
    dfa_->setDefaultTransition(4, 8);
    dfa_->setDefaultTransition(5, 8);

    // octet 4: states 6→7 (accept)
    dfa_->addRangeTransition(6, '0', '9', 7);
    dfa_->addRangeTransition(7, '0', '9', 7);
    dfa_->setDefaultTransition(6, 8);
    dfa_->setDefaultTransition(7, 8);

    (void)addOctetState; // silence unused warning
}

bool IPv4Validator::validOctet(const std::string& s) {
    if (s.empty() || s.size() > 3) return false;
    // No leading zeros unless the value itself is "0"
    if (s.size() > 1 && s[0] == '0') return false;
    int val = std::stoi(s);
    return val >= 0 && val <= 255;
}

DFAResult IPv4Validator::validate(const std::string& input) const {
    // First run structural DFA
    DFAResult res = dfa_->simulate(input);
    if (!res.valid) return res;

    // Then validate each octet is 0-255
    std::stringstream ss(input);
    std::string octet;
    int pos = 0;
    while (std::getline(ss, octet, '.')) {
        if (!validOctet(octet)) {
            res.valid          = false;
            res.error_position = pos;
            res.error_message  = "Octet '" + octet +
                                 "' is out of range 0-255";
            return res;
        }
        pos += (int)octet.size() + 1;
    }

    return res;
}