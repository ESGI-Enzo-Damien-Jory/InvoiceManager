'use client';

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
import { toast } from 'react-toastify';

const InputField = ({
  id,
  name,
  placeholder,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
}) => (
  <div className={styles.input_with_icon}>
    {Icon && <Icon className={styles.icon_inside_input} />}
    <input
      type="text"
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
  icon: PropTypes.elementType,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  error: PropTypes.string,
};

const initialFormData = {
  first_name: '',
  last_name: '',
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  state: '',
  zip: '',
};

export default function CreateForm({ selectedOption, rawQueryMethod }) {
  const isIndividual = selectedOption === 'Individuals';
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    const result = validateForm(updatedFormData);
    setErrors(result.getErrors());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecution = async () => {
    const toastId = toast('Loading...', {
      style: { backgroundColor: '#33353a', color: '#fff' },
    });

    const validationSuite = validateForm(formData);

    if (validationSuite.hasErrors()) {
      console.log('Validation errors:', validationSuite.getErrors());
      toast.update(toastId, {
        render: 'Please fix the validation errors',
        type: 'warning',
        isLoading: false,
      });
      return;
    }

    try {
      const submissionData = validateForm.getData();

      await rawQueryMethod(submissionData);
      toast.update(toastId, {
        render: 'Client Created!',
        type: 'success',
        isLoading: false,
      });
      resetFormData();
    } catch (error) {
      toast.update(toastId, {
        render: error.message,
        type: 'error',
        isLoading: false,
      });
    }
  };

  return (
    <div className={styles.main_wrapper}>
      <div className={styles.left_box}>
        <section>
          <h3>{isIndividual ? 'Create Client' : 'Create Company'}</h3>
          <div className={styles.input_group}>
            {isIndividual ? (
              <>
                <InputField
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                  icon={FiUser}
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.first_name}
                />
                <InputField
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                  icon={FiUser}
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.last_name}
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
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              icon={FiMail}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
            />
            <InputField
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              icon={FiPhone}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
            />
          </div>
        </section>

        <section>
          <h3>Billing</h3>
          <div>
            <div className={styles.billing_stacked_infos}>
              <InputField
                id="address"
                name="address"
                placeholder="Address"
                icon={FiHome}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.address}
              />
              <InputField
                id="city"
                name="city"
                placeholder="City"
                icon={MdLocationCity}
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.city}
              />
            </div>
            <div className={styles.billing_stacked_infos}>
              <InputField
                id="zip"
                name="zip"
                placeholder="Zip/Postal Code"
                icon={FiHash}
                value={formData.zip}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.zip}
              />
              <InputField
                id="state"
                name="state"
                placeholder="State/Region"
                icon={MdLocationCity}
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.state}
              />
              <InputField
                id="country"
                name="country"
                placeholder="Country"
                icon={FiMapPin}
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.country}
              />
            </div>
          </div>
        </section>
      </div>

      <div className={styles.options_section}>
        <OptionSection isIndividual={isIndividual} />
        <div className={styles.button_group}>
          <button>Cancel</button>
          <button
            onClick={() => {
              handleExecution();
            }}
          >
            Save {isIndividual ? 'Client' : 'Company'}
          </button>
        </div>
      </div>
    </div>
  );
}

CreateForm.propTypes = {
  selectedOption: PropTypes.string.isRequired,
  rawQueryMethod: PropTypes.func.isRequired,
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
