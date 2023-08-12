import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const Task = ({ text='', done, toggleDone, deleteTask }) => {
  return (
    <div className="task">
      <div className={"radio" + (done ? ' done' : '')} onClick={toggleDone} ></div>
      <div className={"text" + (done ? ' done-text' : '')}>{text}</div>
      <div className="text-button" onClick={deleteTask} >delete</div>
    </div>
  );
};

Task.propTypes = {
  text: PropTypes.string.isRequired,
  toggleDone: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  done: PropTypes.bool.isRequired
};
