import React from 'react';
import styles from './InvoiceTemplate.module.scss';
import '../../../styles/_templates/InvoiceStyles.scss';
import PropTypes from 'prop-types';
import {
  BsFileEarmarkPdf,
  BsFileEarmarkWord,
  BsFileEarmarkText,
} from 'react-icons/bs';
import HorizontalSeparatorLine from '@/components/_atoms/HoriontalSeparatorLine/HorizontalSeparatorLine';
import Placeholder from '@/components/_atoms/Placeholder/Placeholder';

const PreviewHeader = ({ selectedFormat, setSelectedFormat }) => (
  <div className={styles.topbar_header}>
    <div className={styles.preview_header}>
      <h3 className={styles.preview_title}>Preview</h3>
      <div className={styles.button_group}>
        <button
          className={`${styles.format_button} ${selectedFormat === 'pdf' ? styles.active : ''}`}
          onClick={() => setSelectedFormat('pdf')}
        >
          <BsFileEarmarkPdf className={styles.icon} />
          PDF
        </button>
        <button
          className={`${styles.format_button} ${selectedFormat === 'docx' ? styles.active : ''}`}
          onClick={() => setSelectedFormat('docx')}
        >
          <BsFileEarmarkWord className={styles.icon} />
          Docx
        </button>
        <button
          className={`${styles.format_button} ${styles.disabled} ${selectedFormat === 'text' ? styles.active : ''}`}
          disabled
        >
          <BsFileEarmarkText className={styles.icon} />
          Text
        </button>
      </div>
    </div>
    <HorizontalSeparatorLine color="#6E6E6E" />
  </div>
);

PreviewHeader.propTypes = {
  selectedFormat: PropTypes.string,
  setSelectedFormat: PropTypes.func,
};

const InvoiceHeader = () => (
  <div className="invoice_header">
    <div className="invoice_title">
      <h2>INV2398-08-087</h2>
    </div>
    <hr className="separator_line" />
  </div>
);

const ClientInfo = ({ client }) => (
  <div className="info_line">
    <h3>Billed To</h3>
    <p>{client.name ? client.name : <Placeholder />}</p>
    <p>{client.email ? client.email : <Placeholder />}</p>
    <p>{client.address ? client.address : <Placeholder size="large" />}</p>
  </div>
);

ClientInfo.propTypes = {
  client: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
  }),
};

const InvoiceDetails = ({ displayData }) => (
  <div className="invoice_details">
    <div className="invoice_line">
      <div className="info_line">
        <h3>Subject</h3>
        <p>
          {displayData.subject?.trim() ? (
            displayData.subject.trim()
          ) : (
            <Placeholder />
          )}
        </p>
      </div>
      <ClientInfo client={displayData.client} />
    </div>
    <div className="invoice_line">
      <div className="info_line">
        <h3>Due date</h3>
        <p>{displayData.dueDate ? displayData.dueDate : <Placeholder />}</p>
      </div>
      <div className="info_line">
        <h3>Currency</h3>
        <p>
          {displayData.currency.name ? (
            displayData.currency.name
          ) : (
            <Placeholder size="large" />
          )}
        </p>
      </div>
    </div>
  </div>
);

InvoiceDetails.propTypes = {
  displayData: PropTypes.shape({
    client: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
    }),
    subject: PropTypes.string,
    dueDate: PropTypes.string,
    currency: PropTypes.shape({
      code: PropTypes.string,
      symbol: PropTypes.string,
      name: PropTypes.string,
    }),
  }),
};

const ProductRow = ({ product, currency }) => (
  <tr>
    <td className="description_column">
      {product.name ? product.name : <Placeholder size="small" />}
    </td>
    <td className="qty_column">
      {product.quantity !== undefined && product.quantity !== null ? (
        product.quantity
      ) : (
        <Placeholder size="integer" />
      )}
    </td>
    <td className="unit_price_column">
      {currency?.symbol}
      {product.price !== undefined && product.price !== null ? (
        parseFloat(product.price).toFixed(2)
      ) : (
        <Placeholder size="integer" />
      )}
    </td>
    <td className="total_column">
      {currency?.symbol}
      {product.price !== undefined && product.quantity !== undefined ? (
        (product.price * (product.quantity || 1)).toFixed(2)
      ) : (
        <Placeholder size="integer" />
      )}
    </td>
  </tr>
);

ProductRow.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
  }),
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    name: PropTypes.string,
  }),
};

const EmptyRow = () => (
  <tr>
    <td className="description_column">
      <Placeholder size="small" />
    </td>
    <td className="qty_column">
      <Placeholder size="integer" />
    </td>
    <td className="unit_price_column">
      <Placeholder size="integer" />
    </td>
    <td className="total_column">
      <Placeholder size="integer" />
    </td>
  </tr>
);

const ProductsTable = ({ products, currency }) => {
  return (
    <table className="items_table">
      <thead>
        <tr>
          <th className="description_column column">DESCRIPTION</th>
          <th className="qty_column column">QTY</th>
          <th className="unit_price_column column">UNIT PRICE</th>
          <th className="total_column column">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductRow
              key={`${product.name}-${product.price}-${product.quantity}`}
              product={product}
              currency={currency}
            />
          ))
        ) : (
          <EmptyRow />
        )}
      </tbody>
    </table>
  );
};

ProductsTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
    })
  ),
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    name: PropTypes.string,
  }),
};

const TotalSection = ({ products, currency }) => {
  const calculateTotals = (products) => {
    if (!products?.length) return { subtotal: null, tax: null, total: null };

    const subtotal = products.reduce(
      (acc, product) => acc + (product.price || 0) * (product.quantity || 1),
      0
    );
    const tax = subtotal * 0.2;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals(products);

  return (
    <div className="totals">
      <div className="totals_content">
        <div className="totals_row">
          <span className="subtotal_text">Subtotal:</span>
          <span>Tax (20%):</span>
          <span>Total:</span>
        </div>
        <div className="totals_row_values">
          <span>
            {subtotal != null ? (
              `${currency.symbol} ${subtotal.toFixed(2)}`
            ) : (
              <Placeholder size="integer" />
            )}
          </span>
          <span>
            {tax != null ? (
              `${currency.symbol} ${tax.toFixed(2)}`
            ) : (
              <Placeholder size="integer" />
            )}
          </span>
          <span>
            {total != null ? (
              `${currency.symbol} ${total.toFixed(2)}`
            ) : (
              <Placeholder size="integer" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

TotalSection.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
    })
  ),
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    name: PropTypes.string,
  }),
};

const InvoiceTemplate = ({
  displayData,
  selectedFormat,
  setSelectedFormat,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.preview_container}>
        <PreviewHeader
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
        />
        <div id="invoice-template" className="invoice_template">
          <InvoiceHeader />
          <InvoiceDetails displayData={displayData} />
          <ProductsTable
            products={displayData?.products}
            currency={displayData?.currency}
          />
          <TotalSection
            products={displayData?.products}
            currency={displayData?.currency}
          />
        </div>
      </div>
    </div>
  );
};

InvoiceTemplate.propTypes = {
  displayData: PropTypes.shape({
    client: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
    }),
    subject: PropTypes.string,
    dueDate: PropTypes.string,
    currency: PropTypes.shape({
      code: PropTypes.string,
      symbol: PropTypes.string,
      name: PropTypes.string,
    }),
    products: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.number,
      })
    ),
  }),
  selectedFormat: PropTypes.string,
  setSelectedFormat: PropTypes.func,
};

export default InvoiceTemplate;
