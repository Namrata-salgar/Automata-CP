#include <iostream>
#include <string>
#include "PhoneValidator.h"

static int passed = 0, failed = 0;

static void check(const std::string& input, bool expected, PhoneValidator& v) {
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
    PhoneValidator v;

    std::cout << "\n══ Phone Validator Tests ══════════════════\n\n";

    std::cout << "  -- Valid phone numbers --\n";
    check("9876543210",       true,  v);   // 10 raw digits (India)
    check("+919876543210",    true,  v);   // compact with country code
    check("+91 98765 43210",  true,  v);   // spaced India format
    check("+1 415 555 0172",  true,  v);   // US format
    check("+44 20 7946 0958", true,  v);   // UK format
    check("1234567",          true,  v);   // 7 digit minimum
    check("+1234567890123",   true,  v);   // 13 digit (valid E.164)
    check("07911123456",      true,  v);   // 11 digits (UK local)

    std::cout << "\n  -- Invalid phone numbers --\n";
    check("",                 false, v);   // empty
    check("12345",            false, v);   // only 5 digits (< 7)
    check("+",                false, v);   // just +
    check("+ 91",             false, v);   // space right after +
    check("abcdefghij",       false, v);   // all letters
    check("+91 123",          false, v);   // too few digits after code
    check("123-456",          false, v);   // only 6 digits
    check("++9198765",        false, v);   // double +

    std::cout << "\n  -- Separator formats --\n";
    check("98765-43210",      true,  v);   // hyphens as separator
    check("9876 543210",      true,  v);   // space as separator
    check("+91-98765-43210",  true,  v);   // hyphen after country code

    std::cout << "\n  -- Digit count edge cases --\n";
    {
        // Exactly 7 digits
        DFAResult r = v.validate("1234567");
        bool ok = r.valid;
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  7 digits is minimum valid\n";
        if (ok) ++passed; else ++failed;
    }
    {
        // Exactly 15 digits (E.164 maximum)
        DFAResult r = v.validate("123456789012345");
        bool ok = r.valid;
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  15 digits is maximum valid\n";
        if (ok) ++passed; else ++failed;
    }
    {
        // 16 digits — too long
        DFAResult r = v.validate("1234567890123456");
        bool ok = !r.valid;
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  16 digits exceeds E.164 maximum\n";
        if (ok) ++passed; else ++failed;
    }

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}