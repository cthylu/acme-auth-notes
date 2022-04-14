import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const Notes = ()=> {
  const notes = this.getNotes();
  return (
    <div>
      <Link to='/home'>Home</Link>
      <div>
        <h2>Notes</h2>
        { notes.map((note) => {
          return (
            <p>{note.title}</p>
          )
        })}
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    getNotes: () => {
      return dispatch()
    }
  }
}

export default connect(state => state, mapDispatchToProps)(Notes);
