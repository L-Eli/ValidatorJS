class Validator {
  constructor(success = true, message = '') {
    this.success = success;
    this.message = message;
  }
}

const Validations = {
  required: 'REQUIRED_VALIDATOR',
  regex: 'REGEX_VALIDATOR',
  email: 'EMAIL_VALIDATOR',
  in: 'IN_LIST_VALIDATOR',
  max: 'MAX_LENGTH_VALIDATOR',
  file: 'FILE_VALIDATOR',
  array: 'ARRAY_VALIDATOR',
};

const Validators = {
  [Validations.required](value, key, options) {
    if (value) {
      return new Validator;
    }

    const message = options.message || `missing '${key}' field.`;
    return new Validator(false, message);
  },
  [Validations.regex](value, key, options) {
    if (!value) {
      return new Validator;
    }

    const pattern = options.pattern || /^$/;
    if (pattern.test(value)) {
      return new Validator;
    }

    const message = options.message || `'${key}' doesn't fulfill regex rule.`;
    return new Validator(false, message);
  },
  [Validations.email](value, key, options) {
    if (!value) {
      return new Validator;
    }

    const message = options.message || `'${key}' must be email format.`;
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return Validators[Validations.regex](value, key, {
      message,
      pattern,
    });
  },
  [Validations.in](value, key, options) {
    if (!value) {
      return new Validator;
    }

    const list = options.list || [];
    if (list.indexOf(value.toString()) > -1) {
      return new Validator;
    }

    const message = options.message || `'${key}' must in list [${list.join(', ')}].`;
    return new Validator(false, message);
  },
  [Validations.max](value, key, options) {
    if (!value) {
      return new Validator;
    }

    const number = options.number || 0;
    if (number < 1) {
      return new Validator;
    }

    if (value.toString().length <= number) {
      return new Validator;
    }

    const message = options.message || `'${key}' too long.`;
    return new Validator(false, message);
  },
  [Validations.file](value, key, options) {
    if (!value) {
      return new Validator;
    }

    if (value instanceof File) {
      const message = options.message || `'${key}' is must be the type of ${type}.`;
      const pattern = RegExp(`${options.type || ''}`);

      return Validators[Validations.regex](value.type, key, {
        message,
        pattern,
      });
    }

    const message = options.message || `'${key}' is must be an instance of File.`;
    return new Validator(false, message);
  },
  [Validations.array](value, key, options) {
    if (!value) {
      return new Validator;
    }

    if (Array.isArray(value)) {
      const validation = options.validation || '';
      if (!validation) {
        return new Validator;
      }
      for (let i = 0; i < value.length; i++) {
        const column = value[i];
        for (const [validatorKey, validatorOptions] of Object.entries(validation)) {
          const nextValidation = Validations[validatorKey];
          return Validators[nextValidation](column, key, validatorOptions);
        }
      }
      return new Validator;
    }

    const message = options.message || `'${key}' must be an array.`;
    return new Validator(false, message);
  }
};

const ValidatorException = (message) => {
  const exception = new Error(message);
  return exception;
}

const validate = (data, rules) => {
  const messages = [];
  for (const [columnKey, columnRule] of Object.entries(rules)) {
    const column = data[columnKey];
    for (const [validatorKey, validatorOptions] of Object.entries(columnRule)) {
      const validation = Validations[validatorKey];
      try {
        const validator = Validators[validation](column, columnKey, validatorOptions);
        if (!validator.success) {
          messages.push(validator.message);
        }
      } catch (error) {
        throw new ValidatorException('Invalid Validation Rule');
      }
    }
  }
  return messages;
};

export default validate;
