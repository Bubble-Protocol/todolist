/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useState } from "react";

export const CopyTextButton = ({ title, copyText, className="text-button" }) => {

  const [text, setText] = useState(title);

  function copyToClipboard() {
    navigator.clipboard.writeText(copyText)
    .then(() => {
      setText('copied!');
      setTimeout(() => setText(title), 2000);
    })
    .catch(err => {
      console.warn('Error in copying text: ', err);
    });
  }

  return (
    <div className={className} onClick={copyToClipboard}>{text}</div>
  );
};

CopyTextButton.propTypes = {
  title: PropTypes.string.isRequired,
  copyText: PropTypes.string.isRequired,
  className: PropTypes.string
};
