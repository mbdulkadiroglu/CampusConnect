import React, { useRef, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Divider } from "@mui/material";

const NotificationDropdown = ({ notifications, isOpen, onClose }) => {
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Click outside detected, closing dropdown');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <Paper ref={dropdownRef} sx={{
      position: 'absolute',
      top: '100%',
      right: 0,
      width: '300px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 'modal',
    }}>
      <List dense>
        {notifications.map((notification, index) => (
          <React.Fragment key={index}>
            <ListItem style={notification.seen ? {} : { borderRight: '3px solid blue' }}>
              <ListItemText primary={notification.title} secondary={notification.time} />
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationDropdown;
