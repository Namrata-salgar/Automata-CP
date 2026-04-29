#include <iostream>
#include <string>
#include "BinaryValidator.h"
#include "HexValidator.h"

static int passed = 0, failed = 0;

template <typename V>
static void check(const std::string& input, bool expected, V& v,
                  const std::string& tag) {
    DFAResult r = v.validate(input);
    if (r.valid == expected) {
        std::cout << "  [PASS]  [" << tag << "]  \"" << input << "\"\n";
        ++passed;
    } else {
        std::cout << "  [FAIL]  [" << tag << "]  \"" << input << "\""
                  << "  expected=" << (expected ? "valid" : "invalid")
                  << "  got="      << (r.valid  ? "valid" : "invalid")
                  << "  msg=\""    << r.error_message << "\"\n";
        ++failed;
    }
}

int main() {
    BinaryValidator bv;
    HexValidator    hv;

    // ─────────────────────────────────────────────────
    //  Binary
    // ─────────────────────────────────────────────────
    std::cout << "\n══ Binary Validator Tests ═════════════════\n\n";

    std::cout << "  -- Valid binary --\n";
    check("0",          true,  bv, "bin");
    check("1",          true,  bv, "bin");
    check("101010",     true,  bv, "bin");
    check("11111111",   true,  bv, "bin");
    check("00000000",   true,  bv, "bin");
    check("0b1101",     true,  bv, "bin");  // 0b prefix
    check("0B0101",     true,  bv, "bin");  // 0B prefix
    check("0b0",        true,  bv, "bin");
    check("0b1",        true,  bv, "bin");
    check("0b10110011", true,  bv, "bin");

    std::cout << "\n  -- Invalid binary --\n";
    check("",           false, bv, "bin");  // empty
    check("2",          false, bv, "bin");  // digit 2
    check("102",        false, bv, "bin");  // digit 2 inside
    check("1a0",        false, bv, "bin");  // letter
    check("0b",         false, bv, "bin");  // prefix with no digits
    check("0b2",        false, bv, "bin");  // invalid digit after prefix
    check("0x101",      false, bv, "bin");  // hex prefix
    check(" 101",       false, bv, "bin");  // leading space
    check("101 ",       false, bv, "bin");  // trailing space

    // ─────────────────────────────────────────────────
    //  Hex
    // ─────────────────────────────────────────────────
    std::cout << "\n══ Hex Validator Tests ════════════════════\n\n";

    std::cout << "  -- Valid hex --\n";
    check("0x0",        true,  hv, "hex");
    check("0xFF",       true,  hv, "hex");
    check("0x1A3F",     true,  hv, "hex");
    check("0xDeAdBeEf", true,  hv, "hex");
    check("0X1A",       true,  hv, "hex");  // uppercase X
    check("0xabcdef",   true,  hv, "hex");
    check("0xABCDEF",   true,  hv, "hex");
    check("0x0000",     true,  hv, "hex");
    check("0xFFFFFFFF", true,  hv, "hex");

    std::cout << "\n  -- Invalid hex --\n";
    check("",           false, hv, "hex");  // empty
    check("1A3F",       false, hv, "hex");  // missing 0x
    check("0x",         false, hv, "hex");  // prefix only
    check("0xGG",       false, hv, "hex");  // invalid hex digit
    check("0b1010",     false, hv, "hex");  // binary prefix
    check("0x 1A",      false, hv, "hex");  // space inside
    check("0X",         false, hv, "hex");  // uppercase X, no digits
    check("ff",         false, hv, "hex");  // no prefix
    check("0x1G2",      false, hv, "hex");  // G is not hex

    std::cout << "\n  -- Error position check (hex) --\n";
    {
        DFAResult r = hv.validate("0xGG");
        bool ok = (r.error_position == 2);  // 'G' is at index 2
        std::cout << (ok ? "  [PASS]" : "  [FAIL]")
                  << "  error_position=2 for \"0xGG\""
                  << "  (got " << r.error_position << ")\n";
        if (ok) ++passed; else ++failed;
    }

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}