import styles from './CreateProductEntryButton.module.scss';
import { IoBagOutline } from 'react-icons/io5';

export default function CreateProductEntryButton() {
  return (
    <div className={styles.create_product_entry_button}>
      <button className={styles.add_user} type="button">
        <IoBagOutline className={styles.icon_add} />
        Add new product
      </button>
    </div>
  );
}
