'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AiOutlineSortAscending } from 'react-icons/ai';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import styles from './Items.module.scss';
import SubNavTitle from '@/components/_atoms/SubNavTitle/SubNavTitle';
import UnderlineNavBar from '@/components/_atoms/UnderlineNavBar/UnderlineNavBar';
import NotFound from '@/components/_atoms/NotFound/NotFound';
import Avatar from '@/components/_atoms/Avatar/Avatar';
import Loader from '@/components/_atoms/Loader/Loader';
import { useUser } from '@clerk/nextjs';
import Popup from '@/components/_atoms/Popup/Popup';
import ItemFilterBar from '@/components/_molecules/ItemFilterBar/ItemFilterBar';

const makeApiRequest = async (url, method, userId, data = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'user-id': userId,
  };

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }

  return method === 'DELETE' ? response : response.json();
};

export default function Items() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [addItem, setAddItem] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_price: '',
    is_active: true,
  });
  const [formError, setFormError] = useState(null);

  const getItemType = useCallback(
    () => (selectedOption === 'Products' ? 'product' : 'service'),
    [selectedOption]
  );

  const handleApiOperation = async (operation) => {
    if (!isSignedIn) {
      throw new Error('User not signed in');
    }

    try {
      await operation();
      await fetchItems();
      setIsPopupOpen(false);
      setAddItem(false);
      setFormError(null);
    } catch (err) {
      setFormError(err.message);
      throw err;
    }
  };

  const fetchItems = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      if (!user?.id) throw new Error('User ID not available');
      const data = await makeApiRequest(
        `/api/items?type=${getItemType()}`,
        'GET',
        user.id
      );
      setItems(data.data);
      setFilteredItems(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user, getItemType]);

  const createItem = async (itemData) => {
    await handleApiOperation(async () => {
      const data = {
        ...itemData,
        type: getItemType(),
      };
      console.log('data', data);
      await makeApiRequest('/api/items', 'POST', user.id, data);
    });
  };

  const updateItem = async (itemId, itemData) => {
    await handleApiOperation(async () => {
      const data = {
        ...itemData,
        type: getItemType(),
      };
      await makeApiRequest(`/api/items/${itemId}`, 'PUT', user.id, data);
    });
  };

  const handleDelete = async (itemId) => {
    await handleApiOperation(async () => {
      await makeApiRequest(`/api/items/${itemId}`, 'DELETE', user.id);
    });
  };

  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedItems = [...filteredItems].sort((a, b) => {
      let aField, bField;
      switch (field) {
        case 'name':
          aField = a.name;
          bField = b.name;
          break;
        case 'price':
          aField = a.default_price;
          bField = b.default_price;
          break;
        default:
          aField = a[field];
          bField = b[field];
      }
      return (aField < bField ? -1 : 1) * (newDirection === 'asc' ? 1 : -1);
    });
    setFilteredItems(sortedItems);
    setSortField(field);
    setSortDirection(newDirection);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || '',
        description: selectedItem.description || '',
        default_price: selectedItem.default_price || '',
        is_active: selectedItem.is_active === true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        default_price: '',
        is_active: true,
      });
    }
  }, [selectedItem, addItem]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      [name]: name === 'is_active' ? value === 'true' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        ...formData,
        default_price: parseFloat(formData.default_price),
      };

      if (selectedItem) {
        await updateItem(selectedItem.id, itemData);
      } else {
        await createItem(itemData);
      }

      setFormData({
        name: '',
        description: '',
        default_price: '',
        is_active: true,
      });
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const getSortIconClassName = (field) =>
    `${styles.sort_icon} ${sortField === field && sortDirection === 'desc' ? styles.rotate : ''}`;

  const renderTableHeader = () => (
    <tr className={styles.header_row}>
      <th
        className={`${styles.name_column} ${styles.sortable}`}
        onClick={() => handleSort('name')}
      >
        NAME
        <AiOutlineSortAscending className={getSortIconClassName('name')} />
      </th>
      <th>DESCRIPTION</th>
      <th className={styles.sortable} onClick={() => handleSort('price')}>
        PRICE
        <AiOutlineSortAscending className={getSortIconClassName('price')} />
      </th>
      <th>STATUS</th>
      <th className={styles.checkbox_header}>SELECT</th>
      <th></th>
    </tr>
  );

  const renderTableRow = (item) => (
    <tr key={item.id} className={`${styles.data_row} ${styles.row_animation}`}>
      <td className={`${styles.name_cell} ${styles.text}`}>
        <Avatar
          src={item.image}
          alt={item.name}
          username={item.name}
          backgroundColor="#26262A"
        />
        <span className={styles.name_text}>{item.name}</span>
      </td>
      <td className={`${styles.text} ${styles.description_cell}`}>
        {item.description || '-'}
      </td>
      <td className={styles.text}>
        ${parseFloat(item.default_price || 0).toFixed(2)}
      </td>
      <td className={styles.text}>
        <span className={item.is_active ? styles.active : styles.inactive}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className={styles.checkbox_container}>
        <label
          className={styles.custom_checkbox}
          aria-label={`Select ${item.name}`}
        >
          <input type="checkbox" className={styles.checkbox_input} />
          <span className={styles.checkbox_indicator}></span>
        </label>
      </td>
      <td>
        <button
          onClick={() =>
            setIsDropdownOpen(isDropdownOpen === item.id ? null : item.id)
          }
          className={styles.three_dots_btn}
        >
          <IoEllipsisHorizontal className={styles.ellipsis_icon} />
        </button>
        {isDropdownOpen === item.id && (
          <div className={styles.dropdown_menu}>
            <button
              onClick={() => {
                setSelectedItem(item);
                setIsPopupOpen(true);
              }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className={styles.parent}>
      <div className={styles.header}>
        <div className={styles.title_row}>
          <SubNavTitle text="Items" />
        </div>
        <UnderlineNavBar
          options={['Products', 'Services']}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        <ItemFilterBar
          items={items}
          onSearch={setFilteredItems}
          setAddItem={setAddItem}
          selectedOption={selectedOption}
        />
      </div>

      <div className={styles.content}>
        {loading && <Loader />}
        {!loading && !error && filteredItems?.length === 0 && (
          <div className={styles.not_found}>
            <NotFound
              text={`No ${selectedOption.toLowerCase()} found`}
              image_name="no_products.svg"
            />
          </div>
        )}
        {!loading && !error && filteredItems.length > 0 && (
          <div className={styles.data_content}>
            <div className={styles.table_container}>
              <table className={styles.table}>
                <thead>{renderTableHeader()}</thead>
                <tbody>{filteredItems.map(renderTableRow)}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Popup
        isOpened={isPopupOpen || addItem}
        setIsOpened={isPopupOpen ? setIsPopupOpen : setAddItem}
        title={`${selectedOption === 'Products' ? 'Product' : 'Service'}`}
      >
        <div className={styles.form_container}>
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className={styles.error_message}>{formError}</div>
            )}
            <div className={styles.form_group}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="default_price">Price</label>
              <input
                type="number"
                id="default_price"
                name="default_price"
                step="0.01"
                min="0"
                value={formData.default_price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="is_active">Status</label>
              <select
                id="is_active"
                name="is_active"
                value={formData.is_active.toString()}
                onChange={handleInputChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className={styles.button_group}>
              <button type="submit">{selectedItem ? 'Update' : 'Save'}</button>
              <button
                type="button"
                onClick={() => {
                  setIsPopupOpen(false);
                  setAddItem(false);
                  setSelectedItem(null);
                  setFormError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Popup>
    </div>
  );
}
