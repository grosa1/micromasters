/* global SETTINGS: false */
import '../global_init';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';

import {
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
} from '../actions';
import { USER_PROFILE_RESPONSE } from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import * as api from '../util/api';

describe("TermsOfService", () => {
  let listenForActions, renderComponent, helper;
  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
  });

  afterEach(() => {
    helper.cleanup();
  });

  it("requires terms of service if user hasn't already agreed to it", done => {
    let response = Object.assign({}, USER_PROFILE_RESPONSE, {
      agreed_to_terms_of_service: false
    });
    helper.profileGetStub.returns(Promise.resolve(response));

    renderComponent("/dashboard").then(() => {
      assert.equal(helper.currentLocation.pathname, "/terms_of_service");

      done();
    });
  });

  it("agrees to terms of service", done => {
    let response = Object.assign({}, USER_PROFILE_RESPONSE, {
      agreed_to_terms_of_service: false
    });
    helper.profileGetStub.returns(Promise.resolve(response));
    let profilePatchStub = helper.sandbox.stub(api, 'patchUserProfile');
    profilePatchStub.throws("Invalid arguments");
    profilePatchStub.withArgs(
      SETTINGS.username,
      Object.assign({}, USER_PROFILE_RESPONSE, {
        agreed_to_terms_of_service: true
      })
    ).returns(Promise.resolve());

    renderComponent("/terms_of_service").then(([component]) => {
      listenForActions([REQUEST_PATCH_USER_PROFILE, RECEIVE_PATCH_USER_PROFILE_SUCCESS], () => {
        let button = component.querySelector(".btn-success");

        TestUtils.Simulate.click(button);
      }).then(() => {
        done();
      });
    });
  });

  it("clicks Cancel on terms of service page", done => {
    let response = Object.assign({}, USER_PROFILE_RESPONSE, {
      agreed_to_terms_of_service: false
    });
    helper.profileGetStub.returns(Promise.resolve(response));

    renderComponent("/terms_of_service").then(([component]) => {
      let cancelLink = component.querySelector(".btn-danger");
      assert.equal(cancelLink.href, "/logout");
      done();
    });
  });
});