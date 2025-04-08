import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClientInfo from '../../_atoms/ClientInfo/ClientInfo';
import ClientActions from '../../_atoms/ClientActions/ClientActions';
import EditForm from '../../_atoms/EditForm/EditForm';
import styles from './ClientWidget.module.scss';

export default function ClientWidget({
  client,
  editableClient,
  isEditing,
  onReset,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
}) {
  const [animationState, setAnimationState] = useState('idle');
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (isEditing && !localIsEditing) {
      setAnimationState('opening');
      setLocalIsEditing(true);
    }
  }, [isEditing, localIsEditing]);

  const handleAnimationEnd = () => {
    if (animationState === 'opening') {
      setAnimationState('idle');
    } else if (animationState === 'closing') {
      setAnimationState('idle');
      setLocalIsEditing(false);
      onCancelEdit();
    }
  };

  const handleEditClick = () => {
    onEdit();
  };

  const handleCancelClick = () => {
    if (localIsEditing) {
      setAnimationState('closing');
    }
  };

  const handleSaveClick = () => {
    if (localIsEditing) {
      onSaveEdit();
      setAnimationState('closing');
    }
  };

  return (
    <div
      ref={widgetRef}
      className={`${styles.client_widget} ${styles[animationState]} ${
        localIsEditing ? styles.editing : ''
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      {localIsEditing ? (
        <EditForm
          editableClient={editableClient}
          onEditChange={onEditChange}
          onSaveEdit={handleSaveClick}
          onCancelEdit={handleCancelClick}
        />
      ) : (
        <div className={styles.view_mode}>
          <ClientInfo client={client} />
          <ClientActions onEdit={handleEditClick} onReset={onReset} />
        </div>
      )}
    </div>
  );
}

ClientWidget.propTypes = {
  client: PropTypes.shape({
    id: PropTypes.number.isRequired,
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
  editableClient: PropTypes.object,
  isEditing: PropTypes.bool.isRequired,
  onReset: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onEditChange: PropTypes.func.isRequired,
};
