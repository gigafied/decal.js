'use strict';

const F = function () { }
const Class = require('../core/Class')
const warn = require('../utils/warn')

module.exports = Class.extend({

  /***********************************************************************

  Adapters are how you interface with your persistence layer.
  Adapters receive requests from the store and perform the necessary actions,
  returning promises that get resolved when operations are complete.

  Generally, you will not interact with Adapters directly, the Store and Models will proxy
  requests to your adapters. This allows you to easily swap out Adapters
  if you want to change your persistence layer, and even mix and match adapters
  for different models.

  For help with writing your own Adapter, {{#crossLink "decal.RESTAdapter"}}{{/crossLink}}
  can be used as a good reference implementation.

  @class decal.Adapter
  @constructor

  @module decal
  @submodule data
  ************************************************************************/

  __init() {

    if (this.fetch === Adapter.prototype.fetch) {
      warn('Adapters must implement the `fetch()` method')
    }

    if (this.fetchAll === Adapter.prototype.fetchAll) {
      warn('Adapters must implement the `fetchAll()` method')
    }

    if (this.createRecord === Adapter.prototype.createRecord) {
      warn('Adapters must implement the `createRecord()` method')
    }

    if (this.updateRecord === Adapter.prototype.updateRecord) {
      warn('Adapters must implement the `updateRecord()` method')
    }

    if (this.deleteRecord === Adapter.prototype.deleteRecord) {
      warn('Adapters must implement the `deleteRecord()` method')
    }

    return this._super.apply(this, arguments);
  },

  /***********************************************************************
  Fetches a record from the persistence layer.

  @method fetch
  @param  {Model} record The record you want to fetch.
  @return {Promise}
  ************************************************************************/
  fetch() {
    return this.fetchRecord.apply(this, arguments);
  },
  fetchRecord: F,

  /***********************************************************************
  Fetches all records of a Model from the persistence layer.

  @method fetchAll
  @param  {ModelClass} Model The Class you want to fetch records of.
  @return {Promise}
  ************************************************************************/
  fetchAll: F,

  /***********************************************************************
  Saves a new record to your persistence layer.

  @method createRecord
  @param  {Model} record The record you want to create.
  @return {Promise}
  ************************************************************************/

  createRecord: F,

  /***********************************************************************
  Updates a record in your persistence layer.

  @method updateRecord
  @param  {Model} record The record you want to update.
  @return {Promise}
  ************************************************************************/

  updateRecord: F,

  /***********************************************************************
  Deletes a record in your persistence layer.

  @method deleteRecord
  @param  {Model} record The record you want to delete.
  @return {Promise}
  ************************************************************************/

  deleteRecord: F,

  /***********************************************************************
  Saves a record in your persistence layer.

  @method saveRecord
  @param  {Model} record The record you want to save. This will call createRecord()
  or updateRecord(), depending on whether or not the record is new.
  @return {Promise}
  ************************************************************************/

  saveRecord(record) {

    if (record.get('isNew')) {
      return this.createRecord(record);
    }

    return this.updateRecord(record);
  },

  /***********************************************************************
  Hook for doing anything you need to based on a new Model definition.

  @method registerModel
  @param  {Model} Model
  ************************************************************************/

  registerModel() {
    // Hook for if you need to do any fancy pants stuff...
  }

});
