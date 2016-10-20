/* global SETTINGS: false */
import React from 'react';
import { assert } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';

import FilterVisibilityToggle from './FilterVisibilityToggle';
import { makeStrippedHtml } from '../../util/util';

describe('FilterVisibilityToggle', () => {
  let renderToggle = (props, children = undefined) => {
    if ( children === undefined) {
      return makeStrippedHtml(<FilterVisibilityToggle {...props} />);
    } else {
      return makeStrippedHtml(
        <FilterVisibilityToggle {...props}>
          { children }
        </FilterVisibilityToggle>
      );
    }
  };

  let checkFilterVisibility = sinon.stub().returns(true);
  let setFilterVisibility = sinon.stub();
  let filterName = 'a filter';
  let sandbox;
  let props;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    props = {
      checkFilterVisibility:  checkFilterVisibility,
      setFilterVisibility:    setFilterVisibility,
      filterName:             filterName,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders children', () => {
    sandbox.stub(FilterVisibilityToggle.prototype, 'getResults').returns(null);
    let toggle = renderToggle(props, <div>Test Text</div>);
    assert.include(toggle, "Test Text");
  });

  it('checks for filter visibility when rendering', () => {
    sandbox.stub(FilterVisibilityToggle.prototype, 'getResults').returns(null);
    renderToggle(props, <div>Test Text</div>);
    assert(checkFilterVisibility.called);
  });

  it('hides toggle icon when no results', () => {
    sandbox.stub(FilterVisibilityToggle.prototype, 'getResults').returns(null);
    const wrapper = mount(
      <FilterVisibilityToggle {...props} >
        <div id="test">Test Text</div>
      </FilterVisibilityToggle>
    );
    const icon = wrapper.find("i.material-icons");
    assert.equal(icon.length, 0);
  });

  it('hides toggle icon when doc_count is 0', () => {
    sandbox.stub(FilterVisibilityToggle.prototype, 'getResults').returns({
      aggregations: {
        test: {
          doc_count: 0
        }
      }
    });
    const wrapper = mount(
      <FilterVisibilityToggle {...props} >
        <div id="test">Test Text</div>
      </FilterVisibilityToggle>
    );
    const icon = wrapper.find("i.material-icons");
    assert.equal(icon.length, 0);
  });

  it('sets filter visibility when clicked', () => {
    sandbox.stub(FilterVisibilityToggle.prototype, 'getResults').returns({
      aggregations: {
        test: {
          doc_count: 9
        }
      }
    });
    const wrapper = mount(
      <FilterVisibilityToggle {...props} >
        <div id="test">Test Text</div>
      </FilterVisibilityToggle>
    );
    const icon = wrapper.find("i.material-icons");

    assert.equal(icon.length, 1);
    icon.simulate('click');
    assert(setFilterVisibility.called);
  });
});
