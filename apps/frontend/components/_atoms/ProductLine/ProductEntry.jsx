import PropTypes from 'prop-types';
import styles from './ProductEntry.module.scss';
import Image from 'next/image';

export default function ProductEntry({
  product,
  currencySymbol,
  variant = 'default',
}) {
  return (
    <div
      className={`${styles.product_entry} ${variant !== 'default' ? styles[variant] : ''}`}
    >
      <div
        className={`${styles.product_icon} ${variant !== 'default' ? styles[variant] : ''}`}
      >
        {product.icon ? (
          <Image
            src={product.icon}
            alt={product.name}
            className={`${styles.icon_image} ${variant !== 'default' ? styles[variant] : ''}`}
            width={40}
            height={40}
          />
        ) : (
          <div
            className={`${styles.product_icon_text} ${variant !== 'default' ? styles[variant] : ''}`}
          >
            {product.name[0]}
          </div>
        )}
      </div>
      <div
        className={`${styles.product_infos} ${variant !== 'default' ? styles[variant] : ''}`}
      >
        <div
          className={`${styles.title_line} ${variant !== 'default' ? styles[variant] : ''}`}
        >
          <div
            className={`${styles.product_category} ${variant !== 'default' ? styles[variant] : ''}`}
          >
            {product.category}
          </div>
          <div
            className={`${styles.product_name} ${variant !== 'default' ? styles[variant] : ''}`}
          >
            {product.name}
          </div>
        </div>
        <div
          className={`${styles.price_line} ${variant !== 'default' ? styles[variant] : ''}`}
        >
          <div
            className={`${styles.product_price} ${variant !== 'default' ? styles[variant] : ''}`}
          >
            {product.price} {currencySymbol}
          </div>
        </div>
      </div>
    </div>
  );
}

ProductEntry.propTypes = {
  product: PropTypes.shape({
    icon: PropTypes.string,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.string,
  currencySymbol: PropTypes.string.isRequired,
};
