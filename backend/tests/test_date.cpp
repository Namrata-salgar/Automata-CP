#include <iostream>
#include <string>
#include "DateValidator.h"

static int passed = 0, failed = 0;

static void check(const std::string& input, bool expected, DateValidator& v) {
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
    DateValidator v;

    std::cout << "\n══ Date Validator Tests ═══════════════════\n\n";

    std::cout << "  -- Valid dates --\n";
    check("01/01/2024",  true,  v);
    check("31/12/1999",  true,  v);
    check("15/08/1947",  true,  v);  // India Independence Day
    check("29/02/2000",  true,  v);  // leap year
    check("28/02/2023",  true,  v);  // non-leap Feb
    check("30/04/2024",  true,  v);  // April has 30 days
    check("31/01/2024",  true,  v);  // Jan has 31 days
    check("01/01/0001",  true,  v);  // earliest representable

    std::cout << "\n  -- Invalid dates --\n";
    check("",            false, v);  // empty
    check("31/02/2024",  false, v);  // Feb never has 31 days
    check("29/02/2023",  false, v);  // 2023 is not a leap year
    check("00/01/2024",  false, v);  // day = 0
    check("01/00/2024",  false, v);  // month = 0
    check("01/13/2024",  false, v);  // month = 13
    check("32/01/2024",  false, v);  // day > 31
    check("31/04/2024",  false, v);  // April has only 30 days
    check("31/06/2024",  false, v);  // June has only 30 days
    check("31/09/2024",  false, v);  // September has only 30 days

    std::cout << "\n  -- Wrong format --\n";
    check("2024/01/01",  false, v);  // YYYY/MM/DD
    check("01-01-2024",  false, v);  // hyphens
    check("1/1/2024",    false, v);  // single digit day/month
    check("01/01/24",    false, v);  // 2-digit year
    check("01/01/2024x", false, v);  // trailing char

    std::cout << "\n  -- Leap year edge cases --\n";
    check("29/02/2000",  true,  v);  // div by 400 → leap
    check("29/02/1900",  false, v);  // div by 100 but not 400 → not leap
    check("29/02/2004",  true,  v);  // div by 4 → leap
    check("29/02/2100",  false, v);  // div by 100 → not leap

    std::cout << "\n  Results: " << passed << " passed, "
              << failed << " failed\n\n";
    return failed == 0 ? 0 : 1;
}