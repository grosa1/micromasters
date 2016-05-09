import React from 'react';
import TextField from 'react-mdl/lib/Textfield';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import Button from 'react-mdl/lib/Button';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import moment from 'moment';
import iso3166 from 'iso-3166-2';
import _ from 'lodash';
import { DATE_FORMAT } from '../constants';

// utility functions for pushing changes to profile forms back to the
// redux store.
// this expects that the `updateProfile` and `profile` props are passed
// in to whatever component it is used in.

// bind to this.boundTextField in the constructor of a form component
// to update text fields when editing the profile
// we pass in a keyset looking like this:
//
// ["top-level-key", index, "nested_object_key"] or just ["top_level_key"]
export function boundTextField(keySet, label) {
  const {
    profile,
    errors,
    updateProfile
  } = this.props;
  let onChange = e => {
    let clone = _.cloneDeep(profile);
    _.set(clone, keySet, e.target.value);
    updateProfile(clone);
  };
  return (
    <TextField
      floatingLabel
      label={label}
      value={_.get(profile, keySet, "")}
      error={_.get(errors, keySet)}
      onChange={onChange} />
  );
}

// bind this to this.boundSelectField in the constructor of a form component
// to update select fields
// pass in the name (used as placeholder), key for profile, and the options.
export function boundSelectField(keySet, label, options) {
  const {
    profile,
    errors,
    updateProfile,
  } = this.props;
  let onChange = value => {
    let clone = _.cloneDeep(profile);
    _.set(clone, keySet, value? value.value : '');
    updateProfile(clone);
  };
  return <div>
    <Select
      options={options}
      value={_.get(profile, keySet)}
      placeholder={label}
      onChange={onChange} />
    <span className="validation-error-text">{_.get(errors, keySet)}</span>
  </div>;
}


// bind this to this.boundStateSelectField in the constructor of a form component
// to update select fields
// pass in the name (used as placeholder), key for profile, and the options.
export function boundStateSelectField(stateKeySet, countryKeySet, label) {
  const {
    updateProfile,
    errors,
    profile,
  } = this.props;
  let onChange = value => {
    let clone = _.cloneDeep(profile);
    _.set(clone, stateKeySet, value ? value.value : null);
    updateProfile(clone);
  };
  let options = [];
  let country = _.get(profile, countryKeySet);
  if (iso3166.data[country] !== undefined) {
    options = Object.keys(iso3166.data[country].sub).map(code => ({
      value: code,
      label: iso3166.data[country].sub[code].name
    }));
    options = _.sortBy(options, 'label');
  }

  return <div>
    <Select
      options={options}
      value={_.get(profile, stateKeySet)}
      placeholder={label}
      onChange={onChange} />
    <span className="validation-error-text">{_.get(errors, stateKeySet)}</span>
  </div>;
}

// bind this to this.boundDateField in the constructor of a form component
// to update date fields
// pass in the name (used as placeholder), key for profile.
export function boundDateField(keySet, label) {
  const {
    profile,
    errors,
    updateProfile,
  } = this.props;

  let onChange = date => {
    let clone = _.cloneDeep(profile);
    // format as ISO-8601
    _.set(clone, keySet, date.format(DATE_FORMAT));
    updateProfile(clone);
  };
  let newDate = _.get(profile, keySet) ? moment(_.get(profile, keySet), DATE_FORMAT) : null;
  return <div>
    <DatePicker
      selected={newDate}
      placeholderText={label}
      showYearDropdown
      onChange={onChange}
    />
    <span className="validation-error-text">{_.get(errors, keySet)}</span>
  </div>;
}
export function boundMonthField(keySet, label) {
  const {updateProfile, errors, profile} = this.props;
  let onChange = month => {
    let clone = _.cloneDeep(profile);

    let currentValue = _.get(clone, keySet);
        // format as ISO-8601
    let dateValue;
    if(!month){
      dateValue = "";
    }else if (currentValue){
      dateValue = moment(currentValue).set('month', month.value);
    } else {
      dateValue = moment().set('date', 1).set('month', month.value);
    }
    if(dateValue.isValid()){
      _.set(clone, keySet, dateValue.format(DATE_FORMAT));
    }
    updateProfile(clone);
  };
  let month = _.get(profile, keySet)? moment(_.get(profile, keySet), DATE_FORMAT).month() : "";
  const monthOptions = [
    { value: 0, label: 'January'},
    { value: 1, label: 'February'},
    { value: 2, label: 'March'},
    { value: 3, label: 'April'},
    { value: 4, label: 'May'},
    { value: 5, label: 'June'},
    { value: 6, label: 'July'},
    { value: 7, label: 'August'},
    { value: 8, label: 'September'},
    { value: 9, label: 'October'},
    { value: 10, label: 'November'},
    {value: 11, label: 'December'}
  ];

  return <div>
    <Select
      options={monthOptions}
      clearable={false}
      value={month}
      placeholder={label}
      onChange={onChange}
    />
    <span className="validation-error-text">{_.get(errors, keySet)}</span>
  </div>;
}

export function boundYearField(keySet, label) {
  const {updateProfile, errors, profile} = this.props;
  let onChange = e => {
    let clone = _.cloneDeep(profile);
    let currentValue = _.get(clone, keySet);
    let year = e.target.value;
    // format as ISO-8601
    let dateValue = '';
    if (year) {
      if (currentValue) {
        dateValue = moment(currentValue).set('year', year);
      } else {
        dateValue = moment().set('date', 1).set('year', year);
      }
      if (dateValue.isValid()) {
        _.set(clone, keySet, dateValue.format(DATE_FORMAT));
      }
      updateProfile(clone);
    }
  };
  let year = _.get(profile, keySet) ? moment(_.get(profile, keySet), DATE_FORMAT).year() : "";
  return <div>
    <TextField
      label={label}
      value={year}
      onChange={onChange}/>
    <span className="validation-error-text">{_.get(errors, keySet)}</span></div>;
}

// bind to this.saveAndContinue.bind(this, '/next/url')
// pass an option callback if you need nested validation
// (see EmploymentTab for an example)
export function saveAndContinue(next, nestedValidationCallback) {
  const {
    saveProfile,
    profile,
    requiredFields,
    validationMessages
  } = this.props;

  let fields;
  if ( _.isFunction(nestedValidationCallback) ) {
    fields = nestedValidationCallback(profile, requiredFields);
  } else {
    fields = requiredFields;
  }

  saveProfile( profile, fields, validationMessages).then(() => {
    this.context.router.push(next);
  });
}

// allows editing an array of objects stored in the profile
// params:
//    arrayName: key the array is stored under on the profile
//    blankEntry: an object with the requisite fields, with undefined, "", or null values
//    formCallBank: a function that takes an index (into the object array) and draws
//      ui (using boundTextField and so on) to edit an object in the array
export function editProfileObjectArray (arrayName, blankEntry, formCallback) {
  const { updateProfile, profile } = this.props;
  if ( profile.hasOwnProperty(arrayName) && !_.isEmpty(profile[arrayName]) ) {
    let editForms = profile[arrayName].map((v, i) => formCallback(i));
    let addAnotherBlankEntry = () => {
      let clone = Object.assign({}, profile);
      clone[arrayName] = clone[arrayName].concat(blankEntry);
      updateProfile(clone);
    };
    editForms.push(
      <Grid className="profile-tab-grid" key={arrayName}>
        <Cell col={12} align='middle'>
          <Button onClick={addAnotherBlankEntry}>
            Add another entry
          </Button>
        </Cell>
      </Grid>
    );
    return editForms;
  } else {
    let startEditing = () => {
      let clone = Object.assign({}, profile);
      clone[arrayName] = [blankEntry];
      updateProfile(clone);
    };
    return (
      <Grid className="profile-tab-grid">
        <Cell col={12} align='middle'>
          <Button onClick={startEditing}>
            Start Editing
          </Button>
        </Cell>
      </Grid>
    );
  }
}
