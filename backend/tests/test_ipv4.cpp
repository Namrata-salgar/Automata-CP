#include <iostream>
#include <vector>
#include <string>
#include "IPv4Validator.h"

static int passed = 0, failed = 0;

static void check(const std::string& input, bool expected, IPv4Validator& v) {
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
    IPv4Validator v;

    std::cout << "\n══ IPv4 Validator Tests ═══════════════════\n\n";

    std::cout << "  -- Valid inputs --\n";
    check("192.168.1.1",      true,  v);
    check("0.0.0.0",          true,  v);
    check("255.255.255.255",  true,  v);
    check("10.0.0.1",         true,  v);
    check("172.16.254.1",     true,  v);
    check("1.2.3.4",          true,  v);
    check("8.8.8.8",          true,  v);

    std::cout << "\n  -- Invalid inputs --\n";
    check("",                 false, v);   // empty
    check("256.1.1.1",        false, v);   // octet > 255
    check("192.168.1",        false, v);   // only 3 octets
    check("1.2.3.4.5",        false, v);   // 5 octets
    check("192.168.01.1",     false, v);   // leading zero
    check("192.168.1.1.1",    false, v);   // extra octet
    check("abc.def.ghi.jkl",  false, v);   // letters
    check("192.168.1.",        false, v);   // trailing dot
    check(".192.168.1.1",      false, v);   // leading dot
    check("999.999.999.999",  false, v);   // all out of range

    std::cout << "\n  -- Boundary octets --\n";
    check("0.0.0.0",          true,  v);
    check("255.0.0.0",        true,  v);
    check("0.255.0.0",        true,  v);
    check("0.0.255.0",        true,  v);
    check("0.0.0.255",        true,  v);
    check("256.0.0.0",        false, v);
    check("0.256.0.0",        false, v);

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}