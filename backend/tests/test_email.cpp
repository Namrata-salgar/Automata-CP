#include <iostream>
#include <vector>
#include <string>
#include "EmailValidator.h"

// ── tiny test harness ─────────────────────────────────────────
static int passed = 0, failed = 0;

static void check(const std::string& input, bool expected,
                  EmailValidator& v) {
    DFAResult r = v.validate(input);
    if (r.valid == expected) {
        std::cout << "  [PASS]  \"" << input << "\"\n";
        ++passed;
    } else {
        std::cout << "  [FAIL]  \"" << input << "\""
                  << "  expected=" << (expected ? "valid" : "invalid")
                  << "  got="      << (r.valid  ? "valid" : "invalid");
        if (!r.valid)
            std::cout << "  msg=\"" << r.error_message << "\"";
        std::cout << "\n";
        ++failed;
    }
}

int main() {
    EmailValidator v;

    std::cout << "\n══ Email Validator Tests ══════════════════\n\n";

    std::cout << "  -- Valid inputs --\n";
    check("user@example.com",               true,  v);
    check("riya.sharma@college.ac.in",      true,  v);
    check("test123@gmail.com",              true,  v);
    check("a@b.co",                         true,  v);
    check("UPPER@Domain.ORG",               true,  v);
    check("under_score@test.net",           true,  v);
    check("dot.name@sub.domain.com",        true,  v);
    check("x@y.io",                         true,  v);

    std::cout << "\n  -- Invalid inputs --\n";
    check("",                               false, v);   // empty
    check("nodomain",                       false, v);   // no @
    check("@nodomain.com",                  false, v);   // starts with @
    check("user@",                          false, v);   // nothing after @
    check("user@domain",                    false, v);   // no dot in domain
    check("user @domain.com",               false, v);   // space in local
    check("user@@domain.com",               false, v);   // double @
    check("user@domain..com",               false, v);   // double dot
    check("user@.domain.com",               false, v);   // dot right after @
    check("user@domain.c",                  true,  v);   // single char TLD allowed

    std::cout << "\n  -- Trace check --\n";
    {
        DFAResult r = v.validate("a@b.co");
        bool ok = !r.trace.empty() && r.trace[0] == 0;
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  trace starts at state 0"
                  << "  (trace size=" << r.trace.size() << ")\n";
        if (ok) ++passed; else ++failed;
    }

    std::cout << "\n  -- Error position check --\n";
    {
        DFAResult r = v.validate("user @domain.com");
        bool ok = (r.error_position == 4); // space at index 4
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  error_position=4 for \"user @domain.com\""
                  << "  (got " << r.error_position << ")\n";
        if (ok) ++passed; else ++failed;
    }

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}