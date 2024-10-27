import { create, test, enforce } from 'vest';
import isEmail from 'email-validator';
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
  isSupportedCountry,
  getExampleNumber,
} from 'libphonenumber-js/max';
import { countries } from 'countries-list';

function getCountryCodeFromName(countryName) {
  return Object.entries(countries).find(
    ([_, data]) => data.name === countryName
  )?.[0];
}

function guessCountryCode(formData) {
  if (!formData.country) {
    return 'US';
  }

  const isoCode = getCountryCodeFromName(formData.country);

  if (isoCode && isSupportedCountry(isoCode)) {
    return isoCode;
  }

  return 'US';
}

function formatPhoneWithCountryCode(phoneNumber, countryCode) {
  if (!phoneNumber) return '';

  if (phoneNumber.startsWith('+')) {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);
    if (parsedNumber?.isValid()) {
      return parsedNumber.format('E.164');
    }
  }

  try {
    let parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);

    if (!parsedNumber) {
      const exampleNumber = getExampleNumber(countryCode, 'mobile');
      const nationalNumberLength = exampleNumber?.nationalNumber.length;
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');

      if (nationalNumberLength && cleanPhone.length === nationalNumberLength) {
        parsedNumber = parsePhoneNumberFromString(
          `+${getCountryCallingCode(countryCode)}${cleanPhone}`
        );
      }
    }

    if (parsedNumber?.isValid()) {
      return parsedNumber.format('E.164');
    }

    parsedNumber = parsePhoneNumberFromString(phoneNumber);
    if (parsedNumber?.isValid()) {
      return parsedNumber.format('E.164');
    }

    return phoneNumber;
  } catch (error) {
    return phoneNumber;
  }
}

export const validateForm = create((formData) => {
  const enrichedFormData = { ...formData };
  let isModified = false;

  test('email', 'Please enter a valid email address', () => {
    enforce(enrichedFormData.email).isNotEmpty();
    enforce(isEmail.validate(enrichedFormData.email)).isTruthy();
  });

  test('phone', 'Please enter a valid phone number', () => {
    if (!enrichedFormData.phone) {
      return;
    }

    const countryCode = guessCountryCode(enrichedFormData);
    const formattedPhone = formatPhoneWithCountryCode(
      enrichedFormData.phone,
      countryCode
    );

    if (formattedPhone && formattedPhone !== enrichedFormData.phone) {
      enrichedFormData.phone = formattedPhone;
      isModified = true;
    }

    const phoneNumber = parsePhoneNumberFromString(enrichedFormData.phone);
    enforce(phoneNumber?.isValid()).isTruthy();
  });

  test('address', 'Address is required', () => {
    enforce(enrichedFormData.address).isNotEmpty();
  });

  test('city', 'City is required', () => {
    enforce(enrichedFormData.city).isNotEmpty();
  });

  if (enrichedFormData.zip) {
    test('zip', 'Zip code format is invalid', () => {
      enforce(enrichedFormData.zip.length > 0).isTruthy();
    });
  }

  if (enrichedFormData.country) {
    test('country', 'Please enter a valid country', () => {
      const validCountries = Object.values(countries).map(
        (country) => country.name
      );
      enforce(validCountries.includes(enrichedFormData.country)).isTruthy();
    });
  }

  test('state', 'State/Region is required', () => {
    enforce(enrichedFormData.state).isNotEmpty();
  });

  if (enrichedFormData.first_name || enrichedFormData.last_name) {
    test('first_name', 'First name is required for individual clients', () => {
      enforce(enrichedFormData.first_name).isNotEmpty();
    });

    test('last_name', 'Last name is required for individual clients', () => {
      enforce(enrichedFormData.last_name).isNotEmpty();
    });
  } else if (enrichedFormData.company_name || enrichedFormData.contact_name) {
    test('company_name', 'Company name is required for company clients', () => {
      enforce(enrichedFormData.company_name).isNotEmpty();
    });

    test('contact_name', 'Contact name is required for company clients', () => {
      enforce(enrichedFormData.contact_name).isNotEmpty();
    });
  } else {
    test(
      'client_info',
      'Either individual or company information is required',
      () => {
        enforce(false).isTruthy();
      }
    );
  }

  validateForm.getData = () => (isModified ? enrichedFormData : formData);
});
