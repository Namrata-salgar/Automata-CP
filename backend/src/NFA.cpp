#include "NFA.h"
#include <stack>
#include <stdexcept>
#include <algorithm>

// ─────────────────────────────────────────────────────────────
//  Constructor
// ─────────────────────────────────────────────────────────────
NFA::NFA(int states, int start, std::set<int> accept_states)
    : num_states_(states),
      start_(start),
      accept_(std::move(accept_states)),
      transitions_(states)
{
    if (start < 0 || start >= states)
        throw std::invalid_argument("NFA: start state out of range");
    for (int s : accept_)
        if (s < 0 || s >= states)
            throw std::invalid_argument("NFA: accept state out of range");
}

// ─────────────────────────────────────────────────────────────
//  Transition builders
// ─────────────────────────────────────────────────────────────
void NFA::addTransition(int from, char ch, int to) {
    if (from < 0 || from >= num_states_ || to < 0 || to >= num_states_)
        throw std::invalid_argument("NFA::addTransition: state out of range");
    transitions_[from][ch].insert(to);
}

void NFA::addRangeTransition(int from, char lo, char hi, int to) {
    for (char c = lo; c <= hi; ++c)
        addTransition(from, c, to);
}

void NFA::addEpsilonTransition(int from, int to) {
    addTransition(from, EPSILON, to);
}

// ─────────────────────────────────────────────────────────────
//  Alphabet
// ─────────────────────────────────────────────────────────────
std::set<char> NFA::alphabet() const {
    std::set<char> alpha;
    for (auto& row : transitions_)
        for (auto& pair : row)
            if (pair.first != EPSILON)
                alpha.insert(pair.first);
    return alpha;
}

// ─────────────────────────────────────────────────────────────
//  Epsilon closure — single state
// ─────────────────────────────────────────────────────────────
std::set<int> NFA::epsilonClosure(int state) const {
    std::set<int>  closure;
    std::stack<int> worklist;

    closure.insert(state);
    worklist.push(state);

    while (!worklist.empty()) {
        int cur = worklist.top(); worklist.pop();

        auto& row = transitions_[cur];
        auto  it  = row.find(EPSILON);
        if (it == row.end()) continue;

        for (int next : it->second) {
            if (!closure.count(next)) {
                closure.insert(next);
                worklist.push(next);
            }
        }
    }
    return closure;
}

// ─────────────────────────────────────────────────────────────
//  Epsilon closure — set of states
// ─────────────────────────────────────────────────────────────
std::set<int> NFA::epsilonClosure(const std::set<int>& states) const {
    std::set<int> closure;
    for (int s : states) {
        auto c = epsilonClosure(s);
        closure.insert(c.begin(), c.end());
    }
    return closure;
}

// ─────────────────────────────────────────────────────────────
//  Move — reachable states on char ch (no epsilon closure)
// ─────────────────────────────────────────────────────────────
std::set<int> NFA::move(const std::set<int>& states, char ch) const {
    std::set<int> result;
    for (int s : states) {
        auto& row = transitions_[s];
        auto  it  = row.find(ch);
        if (it != row.end())
            result.insert(it->second.begin(), it->second.end());
    }
    return result;
}

// ─────────────────────────────────────────────────────────────
//  simulate — on-the-fly subset construction
// ─────────────────────────────────────────────────────────────
NFAResult NFA::simulate(const std::string& input) const {
    NFAResult res;
    res.valid          = false;
    res.error_position = -1;

    // Initial set = ε-closure of start state
    std::set<int> current = epsilonClosure(start_);
    res.state_sets.push_back(current);

    // Representative state for the UI trace = smallest state in current set
    auto representative = [](const std::set<int>& s) -> int {
        return s.empty() ? -1 : *s.begin();
    };
    res.trace.push_back(representative(current));

    for (int i = 0; i < (int)input.size(); ++i) {
        char ch = input[i];

        // Move on ch, then take ε-closure
        std::set<int> next = epsilonClosure(move(current, ch));

        if (next.empty()) {
            // Dead configuration — no valid transition
            res.error_position = i;
            res.error_message  = "No transition from {";
            bool first = true;
            for (int s : current) {
                if (!first) res.error_message += ",";
                res.error_message += std::to_string(s);
                first = false;
            }
            res.error_message += "} on character '" + std::string(1, ch) +
                                 "' at position " + std::to_string(i);
            return res;
        }

        current = std::move(next);
        res.state_sets.push_back(current);
        res.trace.push_back(representative(current));
    }

    // Accept if any state in current set is an accept state
    for (int s : current) {
        if (accept_.count(s)) {
            res.valid = true;
            break;
        }
    }

    if (!res.valid) {
        res.error_message = "Input ended in non-accepting configuration {";
        bool first = true;
        for (int s : current) {
            if (!first) res.error_message += ",";
            res.error_message += std::to_string(s);
            first = false;
        }
        res.error_message += "}";
    }

    return res;
}

// ─────────────────────────────────────────────────────────────
//  toDFA — full subset construction (Rabin–Scott)
//
//  Each DFA state corresponds to a subset of NFA states.
//  We enumerate all reachable subsets and build a DFA over them.
//
//  The returned DFA has:
//    state 0            = dead/trap state (empty NFA set)
//    state 1            = start state     (ε-closure of NFA start)
//    states 2, 3, ...   = remaining reachable subsets
// ─────────────────────────────────────────────────────────────
DFA NFA::toDFA() const {
    using StateSet = std::set<int>;

    std::set<char> alpha = alphabet();

    // Map from NFA-subset → DFA state id
    std::map<StateSet, int> subset_to_id;
    std::vector<StateSet>   id_to_subset;

    // Reserve id 0 for the dead (empty) state
    StateSet dead_set;
    subset_to_id[dead_set] = 0;
    id_to_subset.push_back(dead_set);

    // Start state = ε-closure of NFA start
    StateSet start_set = epsilonClosure(start_);
    subset_to_id[start_set] = 1;
    id_to_subset.push_back(start_set);

    // Worklist of DFA states to process
    std::stack<int> worklist;
    worklist.push(1);

    // Transition table for the new DFA: trans[dfa_state][ch] = dfa_state
    std::vector<std::map<char, int>> trans;
    trans.push_back({});  // id 0 (dead) — will be filled with self-loops later
    trans.push_back({});  // id 1 (start)

    while (!worklist.empty()) {
        int dfa_id = worklist.top(); worklist.pop();
        const StateSet& cur_set = id_to_subset[dfa_id];

        for (char ch : alpha) {
            StateSet next_set = epsilonClosure(move(cur_set, ch));

            // Get or create DFA id for next_set
            auto it = subset_to_id.find(next_set);
            int  next_id;
            if (it != subset_to_id.end()) {
                next_id = it->second;
            } else {
                next_id = (int)id_to_subset.size();
                subset_to_id[next_set] = next_id;
                id_to_subset.push_back(next_set);
                trans.push_back({});
                worklist.push(next_id);
            }

            trans[dfa_id][ch] = next_id;
        }
    }

    // Build accept set for DFA:
    // a DFA state is accepting if its NFA subset contains any NFA accept state
    std::set<int> dfa_accept;
    for (int dfa_id = 0; dfa_id < (int)id_to_subset.size(); ++dfa_id) {
        for (int nfa_state : id_to_subset[dfa_id]) {
            if (accept_.count(nfa_state)) {
                dfa_accept.insert(dfa_id);
                break;
            }
        }
    }

    int total_dfa_states = (int)id_to_subset.size();

    // Construct DFA object (start = 1)
    DFA dfa(total_dfa_states, 1, dfa_accept);

    // Install transitions
    for (int dfa_id = 0; dfa_id < total_dfa_states; ++dfa_id) {
        for (auto& pair : trans[dfa_id]) {
            dfa.addTransition(dfa_id, pair.first, pair.second);
        }
        // Dead state 0: everything loops back to 0
        if (dfa_id == 0) {
            dfa.setDefaultTransition(0, 0);
        }
        // For all other states: anything not explicitly mapped → dead state 0
        dfa.setDefaultTransition(dfa_id, 0);
    }

    return dfa;
}