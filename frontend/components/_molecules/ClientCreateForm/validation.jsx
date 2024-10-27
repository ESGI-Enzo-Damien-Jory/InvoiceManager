import { create, test, enforce } from 'vest';
import isEmail from 'email-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { countries } from 'countries-list';

export const validateForm = create((formData) => {
  test('client_email', 'Please enter a valid email address', () => {
    enforce(isEmail.validate(formData.client_email)).isTruthy();
  });

  test('client_phone', 'Please enter a valid phone number', () => {
    const defaultCountryCode = formData.client_country
      ? formData.client_country
      : 'US';
    const phoneNumber = parsePhoneNumberFromString(
      formData.client_phone,
      defaultCountryCode
    );

    enforce(phoneNumber && phoneNumber.isValid()).isTruthy();
  });

  test('client_zip', 'Please enter a valid zip code', () => {
    enforce(/^\d{5}(-\d{4})?$/.test(formData.client_zip)).isTruthy();
  });

  test('client_address', 'Address is required', () => {
    enforce(formData.client_address).isNotEmpty();
  });

  test('client_city', 'City is required', () => {
    enforce(formData.client_city).isNotEmpty();
  });

  test('client_country', 'Please enter a valid country', () => {
    const validCountries = Object.values(countries).map(
      (country) => country.name
    );
    enforce(validCountries.includes(formData.client_country)).isTruthy();
  });

  test('client_state', 'State/Region is required', () => {
    enforce(formData.client_state).isNotEmpty();
  });

  [
    'client_first_name',
    'client_last_name',
    'company_name',
    'contact_name',
  ].forEach((field) =>
    test(field, 'This field is required', () => {
      enforce(formData[field]).isNotEmpty();
    })
  );
});
