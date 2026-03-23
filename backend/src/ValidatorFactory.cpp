#include "ValidatorFactory.h"
#include "EmailValidator.h"
#include "IPv4Validator.h"
#include "DateValidator.h"
#include "BinaryValidator.h"
#include "HexValidator.h"
#include "NameValidator.h"
#include "PhoneValidator.h"

ValidatorFactory::ValidatorFactory() {
    validators_["email"]  = std::make_unique<EmailValidator>();
    validators_["ipv4"]   = std::make_unique<IPv4Validator>();
    validators_["date"]   = std::make_unique<DateValidator>();
    validators_["binary"] = std::make_unique<BinaryValidator>();
    validators_["hex"]    = std::make_unique<HexValidator>();
    validators_["name"]   = std::make_unique<NameValidator>();
    validators_["phone"]  = std::make_unique<PhoneValidator>();
}

const Validator* ValidatorFactory::get(const std::string& format) const {
    auto it = validators_.find(format);
    if (it == validators_.end()) return nullptr;
    return it->second.get();
}