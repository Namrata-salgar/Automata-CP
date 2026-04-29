#include <iostream>
#include <string>
#include "NameValidator.h"

static int passed = 0, failed = 0;

static void check(const std::string& input, bool expected, NameValidator& v) {
    DFAResult r = v.validate(input);
    if (r.valid == expected) {
        std::cout << "  [PASS]  \"" << input << "\"\n";
        ++passed;
    } else {
        std::cout << "  [FAIL]  \"" << input << "\""
                  << "  expected=" << (expected ? "valid" : "invalid")
                  << "  got="      << (r.valid  ? "valid" : "invalid")
                  << "  msg=\""    << r.error_message << "\"\n";
        ++failed;
    }
}

int main() {
    NameValidator v;

    std::cout << "\n══ Name Validator Tests ═══════════════════\n\n";

    std::cout << "  -- Valid names --\n";
    check("Riya",             true,  v);   // single name
    check("Riya Sharma",      true,  v);   // first + last
    check("Mary Jane Watson", true,  v);   // three parts
    check("Mary-Jane",        true,  v);   // hyphenated
    check("O Brien",          true,  v);   // space separated
    check("A B",              true,  v);   // minimal two-part
    check("Jean-Claude Van Damme", true, v);

    std::cout << "\n  -- Invalid names --\n";
    check("",                 false, v);   // empty
    check("riya",             false, v);   // starts lowercase
    check("riya sharma",      false, v);   // both lowercase
    check("Riya123",          false, v);   // digit inside
    check("Riya@Sharma",      false, v);   // special char
    check("Riya ",            false, v);   // trailing space (ends in separator state)
    check(" Riya",            false, v);   // leading space
    check("Riya  Sharma",     false, v);   // double space
    check("Riya sharma",      false, v);   // second word lowercase
    check("123",              false, v);   // all digits

    std::cout << "\n  -- Hyphen edge cases --\n";
    check("Mary-Jane",        true,  v);   // valid hyphenated
    check("Mary-jane",        false, v);   // second part lowercase
    check("Mary-",            false, v);   // trailing hyphen
    check("-Mary",            false, v);   // leading hyphen

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}