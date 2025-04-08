import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ProductEntry from '../../_atoms/ProductLine/ProductEntry';
import CreateProductEntryButton from '../../_atoms/CreateProductEntryButton/CreateProductEntryButton';
import { AiOutlineClose } from 'react-icons/ai';
import { BiCartAdd } from 'react-icons/bi';
import styles from './ProductSearchDropdown.module.scss';
import Dropdown from '@/components/_atoms/Dropdown/Dropdown';

export default function ProductSearchDropdown({
  products,
  selectedProducts,
  onSelect,
  currencySymbol = '$',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const dropdownRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value !== '') {
      setIsDropdownVisible(true);
    } else {
      closeDropdown();
    }
  };

  const handleInputFocus = () => {
    if (searchQuery) {
      setIsDropdownVisible(true);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedProducts.some((selected) => selected.name === product.name)
  );

  const handleProductSelect = (product) => {
    const updatedSelectedProducts = [
      ...selectedProducts,
      { ...product, quantity: 1, id: Date.now() },
    ];
    onSelect(updatedSelectedProducts);
    closeDropdown();
    setSearchQuery('');
    setIsSearchVisible(false);
  };

  const handleProductRemove = (productId) => {
    const updatedSelectedProducts = selectedProducts.filter(
      (product) => product.id !== productId
    );
    onSelect(updatedSelectedProducts);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedSelectedProducts = selectedProducts.map((selectedProduct) =>
      selectedProduct.id === productId
        ? { ...selectedProduct, quantity: newQuantity }
        : selectedProduct
    );
    onSelect(updatedSelectedProducts);
  };

  const closeDropdown = () => {
    setAnimationState('closing');
    setTimeout(() => {
      setIsDropdownVisible(false);
      setAnimationState('idle');
    }, 400);
  };

  const handleClickOutside = useCallback(
    (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    },
    [dropdownRef]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const showSearchInput = () => {
    setIsSearchVisible(true);
  };

  return (
    <div className={styles.product_search_dropdown} ref={dropdownRef}>
      {selectedProducts.length > 0 && (
        <div className={styles.selected_products}>
          {selectedProducts.map(
            ({ name, category = 'Category', price, quantity, id }) => (
              <div key={id} className={styles.product_preview}>
                <ProductEntry
                  product={{ name, category, price }}
                  currencySymbol={currencySymbol}
                  variant="selected"
                />
                <div className={styles.actions}>
                  <Dropdown
                    options={[...Array(10).keys()].map((i) => i + 1)}
                    value={quantity}
                    onChange={(newQuantity) =>
                      handleQuantityChange(id, newQuantity)
                    }
                  />
                  <button
                    className={styles.reset_button}
                    onClick={() => handleProductRemove(id)}
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {isSearchVisible || selectedProducts.length === 0 ? (
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            placeholder="Find items"
            className={`${styles.search_input} ${
              isDropdownVisible ? styles.search_input_active : ''
            }`}
          />
          {isDropdownVisible && (
            <div
              className={`${styles.dropdown} ${styles[animationState]}`}
              onAnimationEnd={() => setAnimationState('idle')}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.name}
                    className={styles.product_item}
                    onClick={() => handleProductSelect(product)}
                  >
                    <ProductEntry
                      product={{
                        ...product,
                        category: product.category || 'Category',
                      }}
                      currencySymbol={currencySymbol}
                    />
                  </button>
                ))
              ) : (
                <></>
              )}
              <CreateProductEntryButton />
            </div>
          )}
        </div>
      ) : (
        <button className={styles.add_product_button} onClick={showSearchInput}>
          <BiCartAdd className={styles.icon_add} />
          Find another item
        </button>
      )}
    </div>
  );
}

ProductSearchDropdown.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      category: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      currencySymbol: PropTypes.string,
    })
  ).isRequired,
  selectedProducts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      category: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  currencySymbol: PropTypes.string,
};
