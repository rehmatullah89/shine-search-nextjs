// models/Location.js

import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  ORIGINAL_ORDER: Number,
  STORE_NAME: String,
  STORE_NAME2: String,
  DOCTOR_NAME: String,
  DOCTOR_FIRST_NAME: String,
  DOCTOR_LAST_NAME: String,
  ADDRESS1: String,
  ADDRESS2: String,
  CITY: String,
  STREET: String,
  ZIP: String,
  PHONE_NO: Number,
  COUNTY: String,
  DLR_TYPE: String,
  LAT: Number,
  LNG: Number,
  ZIP4: Number,
  TAX_ID: Number,
  ID: Number,
  LATITUDE: Number,
  LONGITUDE: Number
});

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
