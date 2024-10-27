import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiMapPin,
  FiHash,
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiCamera,
  FiAlertTriangle,
} from 'react-icons/fi';
import { MdLocationCity } from 'react-icons/md';
import PropTypes from 'prop-types';
import { validateForm } from './validation';
import styles from './CreateForm.module.scss';

const InputField = ({
  id,
  name,
  placeholder,
  type = 'text',
  size = 'default',
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
}) => (
  <div
    className={`${styles.input_with_icon} ${size === 'small' ? styles.small : ''}`}
  >
    {Icon && <Icon className={styles.icon_inside_input} />}
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`${styles.input_field} ${error ? styles.error_border : ''}`}
      placeholder={placeholder}
    />
    {error && <p className={styles.error_text}>{error}</p>}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string,
  size: PropTypes.string,
  icon: PropTypes.elementType,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default function CreateForm({ selectedOption }) {
  const isIndividual = selectedOption === 'Individuals';

  const [formData, setFormData] = useState({
    client_first_name: '',
    client_last_name: '',
    company_name: '',
    contact_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    client_city: '',
    client_country: '',
    client_state: '',
    client_zip: '',
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const result = validateForm({ ...formData, [name]: value });
    setErrors(result.getErrors());
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <div className={styles.main_wrapper}>
      <div className={styles.left_box}>
        <section>
          <h3>{isIndividual ? 'Create Client' : 'Create Company'}</h3>
          <div className={styles.input_group}>
            {isIndividual ? (
              <>
                <InputField
                  id="client_first_name"
                  name="client_first_name"
                  placeholder="First Name"
                  size="small"
                  icon={FiUser}
                  value={formData.client_first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.client_first_name}
                />
                <InputField
                  id="client_last_name"
                  name="client_last_name"
                  placeholder="Last Name"
                  size="small"
                  icon={FiUser}
                  value={formData.client_last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.client_last_name}
                />
              </>
            ) : (
              <>
                <InputField
                  id="company_name"
                  name="company_name"
                  placeholder="Company Name"
                  icon={FiUser}
                  value={formData.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.company_name}
                />
                <InputField
                  id="contact_name"
                  name="contact_name"
                  placeholder="Contact Full Name"
                  icon={FiUser}
                  value={formData.contact_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.contact_name}
                />
              </>
            )}
          </div>
        </section>

        <section>
          <h3>Contact</h3>
          <div className={styles.contact_row}>
            <InputField
              id="client_email"
              name="client_email"
              type="email"
              placeholder="Email"
              icon={FiMail}
              value={formData.client_email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.client_email}
            />
            <InputField
              id="client_phone"
              name="client_phone"
              type="tel"
              placeholder="Phone Number"
              icon={FiPhone}
              value={formData.client_phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.client_phone}
            />
          </div>
        </section>

        <section>
          <h3>Billing</h3>
          <div>
            <div className={styles.billing_stacked_infos}>
              <InputField
                id="client_address"
                name="client_address"
                placeholder="Address"
                icon={FiHome}
                value={formData.client_address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_address}
              />
              <InputField
                id="client_city"
                name="client_city"
                placeholder="City"
                icon={MdLocationCity}
                value={formData.client_city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_city}
              />
            </div>
            <div className={styles.billing_stacked_infos}>
              <InputField
                id="client_zip"
                name="client_zip"
                placeholder="Zip/Postal Code"
                icon={FiHash}
                value={formData.client_zip}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_zip}
              />
              <InputField
                id="client_state"
                name="client_state"
                placeholder="State/Region"
                icon={MdLocationCity}
                value={formData.client_state}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_state}
              />
              <InputField
                id="client_country"
                name="client_country"
                placeholder="Country"
                icon={FiMapPin}
                value={formData.client_country}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_country}
              />
            </div>
          </div>
        </section>
      </div>

      <div className={styles.options_section}>
        <OptionSection isIndividual={isIndividual} />
        <div className={styles.button_group}>
          <button>Cancel</button>
          <button disabled={!isFormValid}>
            Save {isIndividual ? 'Client' : 'Company'}
          </button>
        </div>
      </div>
    </div>
  );
}

CreateForm.propTypes = {
  selectedOption: PropTypes.string.isRequired,
};

const OptionSection = ({ isIndividual }) => (
  <div className={styles.options}>
    <OptionItem
      icon={FiClock}
      title="Send Payment Reminders"
      description={`Send reminders to this ${isIndividual ? 'individual' : 'company'} client`}
    />
    <OptionItem
      icon={FiDollarSign}
      title="Charge Late Fees"
      description="Flat or percentage-based fees"
    />
    <OptionItem
      icon={FiCreditCard}
      title="Default Client Currency"
      description="Choose a default currency"
    />
    {isIndividual && (
      <OptionItem
        icon={FiCamera}
        title="Profile Picture"
        description="Upload a profile picture for your client"
      />
    )}
    <OptionItem
      icon={FiAlertTriangle}
      title="Unsafe Zone"
      description={`Options to delete or disable this ${isIndividual ? 'client' : 'company'}`}
    />
  </div>
);

OptionSection.propTypes = {
  isIndividual: PropTypes.bool.isRequired,
};

const OptionItem = ({ icon: Icon, title, description }) => (
  <div className={styles.option_item}>
    {Icon && <Icon className={styles.option_icon} />}
    <div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

OptionItem.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
