#pragma once
#include "Validator.h"
#include <memory>
#include <string>
#include <unordered_map>

// Factory that owns one instance of each validator.
// Call get("email") to retrieve the right one.
//
class ValidatorFactory {
public:
    ValidatorFactory();

    // Returns pointer to validator for the given format key.
    // Returns nullptr if key is unknown.
    const Validator* get(const std::string& format) const;

private:
    std::unordered_map<std::string, std::unique_ptr<Validator>> validators_;
};