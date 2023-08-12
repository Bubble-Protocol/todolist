import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const TextBox = ({ text, onChange, onEnter, disabled=false, valid=true }) => {
  return (
    <div className="textbox">
      <input 
        type="text" 
        className={"text" + (!valid ? " invalid" : "")} 
        value={text} 
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => onEnter && text && e.key === 'Enter' && onEnter()}
        disabled={disabled} 
      />
    </div>
  );
};

TextBox.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onEnter: PropTypes.func,
  disabled: PropTypes.bool,
  valid: PropTypes.bool,
};
