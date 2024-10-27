import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiMapPin,
  FiHash,
} from 'react-icons/fi';
import { MdLocationCity } from 'react-icons/md';

import styles from './CreateForm.module.scss';

const InputField = ({
  id,
  placeholder,
  type = 'text',
  size = 'default',
  icon: Icon,
}) => (
  <div
    className={`${styles.input_with_icon} ${size === 'small' ? styles.small : ''} ${size === 'xsmall' ? styles.xsmall : ''}`}
  >
    {Icon && <Icon className={styles.icon_inside_input} />}
    <input
      type={type}
      id={id}
      className={styles.input_field}
      placeholder={placeholder}
    />
  </div>
);

export default function CreateForm({ selectedOption }) {
  const isIndividual = selectedOption === 'Individuals';

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
                  placeholder="First Name"
                  size="small"
                  icon={FiUser}
                />
                <InputField
                  id="client_last_name"
                  placeholder="Last Name"
                  size="small"
                  icon={FiUser}
                />
              </>
            ) : (
              <>
                <InputField
                  id="company_name"
                  placeholder="Company Name"
                  icon={FiUser}
                />
                <InputField
                  id="contact_name"
                  placeholder="Contact Full Name"
                  icon={FiUser}
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
              type="email"
              placeholder="Email"
              icon={FiMail}
            />
            <InputField
              id="client_phone"
              type="tel"
              placeholder="Phone Number"
              icon={FiPhone}
            />
          </div>
        </section>

        <section>
          <h3>Billing</h3>
          <div>
            <InputField
              id="client_address"
              placeholder="Address"
              icon={FiHome}
            />
            <div className={styles.billing_stacked_infos}>
              <InputField id="client_city" placeholder="City" icon={FiMapPin} />
              <InputField
                id="client_state"
                placeholder="State/Region"
                icon={MdLocationCity}
              />
              <InputField
                id="client_zip"
                placeholder="Zip/Postal Code"
                icon={FiHash}
              />
            </div>
          </div>
        </section>
      </div>

      <div className={styles.options_section}>
        <div>
          <h3>{isIndividual ? 'Client Options' : 'Company Options'}</h3>
          <OptionSection isIndividual={isIndividual} />
        </div>

        <div className={styles.button_group}>
          <button>Cancel</button>
          <button>Save {isIndividual ? 'Client' : 'Company'}</button>
        </div>
      </div>
    </div>
  );
}

const OptionSection = ({ isIndividual }) => (
  <>
    <OptionItem
      title="Send Payment Reminders"
      description={`Send reminders to this ${isIndividual ? 'individual' : 'company'} client`}
    />
    <OptionItem
      title="Charge Late Fees"
      description="Flat or percentage-based fees"
    />
    <OptionItem
      title="Default Client Currency"
      description="Choose a default currency"
    />
    <OptionItem
      title="Profile Picture"
      description={`Upload a profile picture for your ${isIndividual ? 'client' : 'company'}`}
    />

    <OptionItem
      title="Unsafe Zone"
      description={`Options to delete or disable this ${isIndividual ? 'client' : 'company'}`}
    />
  </>
);

const OptionItem = ({ title, description }) => (
  <div>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);
