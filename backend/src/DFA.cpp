#include "DFA.h"
#include <stdexcept>

DFA::DFA(int states, int start, std::set<int> accept_states)
    : num_states_(states),
      start_(start),
      accept_(std::move(accept_states)),
      transitions_(states),
      defaults_(states, -1)
{
    if (start < 0 || start >= states)
        throw std::invalid_argument("Start state out of range");
}

void DFA::addTransition(int from, char ch, int to) {
    transitions_[from][ch] = to;
}

void DFA::addRangeTransition(int from, char lo, char hi, int to) {
    for (char c = lo; c <= hi; ++c)
        transitions_[from][c] = to;
}

void DFA::setDefaultTransition(int from, int to) {
    defaults_[from] = to;
}

int DFA::step(int state, char ch) const {
    auto& row = transitions_[state];
    auto  it  = row.find(ch);
    if (it != row.end()) return it->second;
    return defaults_[state];   // -1 if no default
}

DFAResult DFA::simulate(const std::string& input) const {
    DFAResult res;
    res.valid          = false;
    res.error_position = -1;

    int current = start_;
    res.trace.push_back(current);

    for (int i = 0; i < (int)input.size(); ++i) {
        int next = step(current, input[i]);

        if (next == -1) {
            // No valid transition — reject here
            res.error_position = i;
            res.error_message  = "Unexpected character '" +
                                 std::string(1, input[i]) +
                                 "' at position " + std::to_string(i) +
                                 " (state " + std::to_string(current) + ")";
            return res;
        }

        current = next;
        res.trace.push_back(current);
    }

    if (accept_.count(current)) {
        res.valid = true;
    } else {
        res.error_message = "Input ended in non-accepting state " +
                            std::to_string(current);
    }

    return res;
}