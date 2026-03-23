#pragma once
#include <vector>
#include <map>
#include <string>
#include <set>

struct DFAResult {
    bool valid;
    std::vector<int> trace;      // sequence of state IDs visited
    int  error_position;         // -1 if valid, else index of bad char
    std::string error_message;
};

class DFA {
public:
    // states        : total number of states (0 .. n-1)
    // start         : start state id
    // accept_states : set of accepting state ids
    DFA(int states, int start, std::set<int> accept_states);

    // Add a transition: from state `from`, on character `ch`, go to state `to`
    void addTransition(int from, char ch, int to);

    // Add a range transition: for every char in [lo..hi], from->to
    void addRangeTransition(int from, char lo, char hi, int to);

    // Add a default (dead/trap) transition for any char not explicitly mapped
    void setDefaultTransition(int from, int to);

    // Run the DFA on input string, return full result with trace
    DFAResult simulate(const std::string& input) const;

private:
    int num_states_;
    int start_;
    std::set<int> accept_;

    // transition_[state][char] = next_state
    std::vector<std::map<char, int>> transitions_;

    // default fallback per state (-1 = no default = reject)
    std::vector<int> defaults_;

    int step(int state, char ch) const;
};