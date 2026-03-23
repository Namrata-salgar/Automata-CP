#pragma once
#include "DFA.h"
#include <vector>
#include <map>
#include <set>
#include <string>
#include <unordered_map>

// ─────────────────────────────────────────────────────────────
//  NFAResult
//  Like DFAResult but also exposes the set-of-states at each step
// ─────────────────────────────────────────────────────────────
struct NFAResult {
    bool                           valid;
    std::vector<std::set<int>>     state_sets;   // active NFA states at each step
    std::vector<int>               trace;        // representative state per step (for UI)
    int                            error_position;
    std::string                    error_message;
};

// ─────────────────────────────────────────────────────────────
//  NFA
//
//  Supports:
//    • Regular char transitions  addTransition(from, ch, to)
//    • Range transitions         addRangeTransition(from, lo, hi, to)
//    • Epsilon transitions       addEpsilonTransition(from, to)
//    • Simulation via subset construction (on-the-fly)
//    • Conversion to an equivalent DFA  toDFA()
//
//  The special char value  NFA::EPSILON (= '\0')  is reserved for
//  epsilon transitions; do NOT use '\0' as a real input character.
// ─────────────────────────────────────────────────────────────
class NFA {
public:
    static constexpr char EPSILON = '\0';

    // states        : total number of NFA states  (0 .. n-1)
    // start         : start state id
    // accept_states : set of accepting state ids
    NFA(int states, int start, std::set<int> accept_states);

    // ── Transition builders ───────────────────────────────

    // Add transition: from --ch--> to
    void addTransition(int from, char ch, int to);

    // Add transitions for every char in [lo, hi]: from --c--> to
    void addRangeTransition(int from, char lo, char hi, int to);

    // Add epsilon transition: from --ε--> to
    void addEpsilonTransition(int from, int to);

    // ── Simulation ────────────────────────────────────────

    // Simulate the NFA on `input` using subset construction.
    // Returns NFAResult with per-step active state sets and a trace.
    NFAResult simulate(const std::string& input) const;

    // ── Conversion ────────────────────────────────────────

    // Convert this NFA to an equivalent DFA via subset construction.
    // The resulting DFA can be used with DFA::simulate() directly.
    // NOTE: state IDs in the returned DFA are synthetic (0,1,2,...);
    //       they do NOT correspond to the original NFA state IDs.
    DFA toDFA() const;

    // ── Accessors (used by toDFA / tests) ─────────────────
    int                                    numStates()    const { return num_states_; }
    int                                    startState()   const { return start_; }
    const std::set<int>&                   acceptStates() const { return accept_; }

    // All chars that appear on any transition (excludes EPSILON)
    std::set<char> alphabet() const;

    // Raw transition table: transitions_[state][ch] = set of target states
    // ch == EPSILON means epsilon transition
    const std::vector<std::map<char, std::set<int>>>& transitions() const {
        return transitions_;
    }

private:
    int          num_states_;
    int          start_;
    std::set<int> accept_;

    // transitions_[state][ch] = { target states }
    std::vector<std::map<char, std::set<int>>> transitions_;

    // ── Internal helpers ──────────────────────────────────

    // Epsilon-closure of a single state
    std::set<int> epsilonClosure(int state) const;

    // Epsilon-closure of a set of states
    std::set<int> epsilonClosure(const std::set<int>& states) const;

    // Move: set of states reachable from `states` on char `ch` (no ε-closure)
    std::set<int> move(const std::set<int>& states, char ch) const;
};