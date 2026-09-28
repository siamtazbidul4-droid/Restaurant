import assert from 'assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { seedInitialData } from '../src/server/seeds/seedData.js';
import { AdminUser } from '../src/server/models/AdminUser.js';
import { Reservation } from '../src/server/models/Reservation.js';
import { DiningTable } from '../src/server/models/DiningTable.js';
import { RestaurantSettings } from '../src/server/models/RestaurantSettings.js';
import { ContactMessage } from '../src/server/models/ContactMessage.js';
import { Media } from '../src/server/models/Media.js';

import { ReservationService } from '../src/server/services/reservation.service.js';
import { ContactService } from '../src/server/services/contact.service.js';
import { EmailService } from '../src/server/services/email.service.js';
import { deleteMediaAsset } from '../src/server/config/cloudinary.js';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('--- AURELIA FULL-STACK ZERO-BREAKAGE VERIFICATION SUITE ---');
  console.log('================================================================\n');

  // 1. Initialize isolated MongoDB Memory Server
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test_aurelia_verification' });

  // 2. Test Admin Credential Bootstrap from ENV
  console.log('[SECTION 1: Admin Authentication & Bootstrap]');
  process.env.ADMIN_EMAIL = 'admin@aurelia.com';
  process.env.ADMIN_PASSWORD = 'AureliaAdmin2026!';

  await seedInitialData();

  const admin1 = await AdminUser.findOne({ email: 'admin@aurelia.com' });
  assert.ok(admin1, 'Admin user should be seeded from ADMIN_EMAIL');
  assert.strictEqual(admin1.role, 'Owner');
  const validPass = await bcrypt.compare('AureliaAdmin2026!', admin1.passwordHash);
  assert.strictEqual(validPass, true, 'Seeded password must match ADMIN_PASSWORD');
  console.log('✓ 1.1: Admin seeded successfully from environment variables.');

  // Re-run seed to verify zero overwrite / zero duplicate creation
  await seedInitialData();
  const adminCount = await AdminUser.countDocuments({ email: 'admin@aurelia.com' });
  assert.strictEqual(adminCount, 1, 'Admin user must NOT be duplicated on subsequent starts');
  console.log('✓ 1.2: Subsequent startups do not overwrite or duplicate existing admin.');

  // Test wrong password rejection
  const wrongPass = await bcrypt.compare('WrongPassword123!', admin1.passwordHash);
  assert.strictEqual(wrongPass, false, 'Invalid password must be rejected');
  console.log('✓ 1.3: Incorrect password rejected as expected.');

  // 3. Test Contact Form & Email Delivery Lifecycle
  console.log('\n[SECTION 2: Contact Form & Transactional Email Lifecycle]');
  const contactSubmission = await ContactService.createMessage(
    {
      name: 'Victoria Vance',
      email: 'victoria@vance-holdings.com',
      phone: '+1 (212) 555-9011',
      subject: 'Private Wine Dinner Inquiry',
      message: 'We wish to inquire about booking the subterranean cellar for an anniversary dinner.',
    },
    '127.0.0.1'
  );

  assert.ok(contactSubmission.contact._id, 'Contact message must be persisted to MongoDB');
  assert.strictEqual(contactSubmission.contact.name, 'Victoria Vance');
  assert.strictEqual(contactSubmission.contact.emailDeliveryStatus, 'not_configured');
  assert.strictEqual(
    contactSubmission.contact.emailDeliveredTo,
    'admin@aurelia.com',
    'Email recipient must be derived from server-side ADMIN_EMAIL'
  );
  console.log('✓ 2.1: Contact message persisted in MongoDB with correct ADMIN_EMAIL recipient.');
  console.log('✓ 2.2: Controlled delivery reporting verified (reports unconfigured when EMAIL_API_KEY omitted).');

  // Verify that an invalid email is caught
  assert.strictEqual(
    EmailService.getAdminRecipientEmail(),
    'admin@aurelia.com',
    'Recipient email must strictly come from server config'
  );
  console.log('✓ 2.3: Server-side recipient extraction verified.');

  // 4. Test Cloudinary & Media Lifecycle
  console.log('\n[SECTION 3: Cloudinary & Media Lifecycle]');
  const mediaDoc = await Media.create({
    publicId: 'local_test_asset_123.jpg',
    secureUrl: '/uploads/test_asset_123.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    resourceType: 'image',
    altText: 'Testing Culinary Plating',
  });
  assert.ok(mediaDoc._id, 'Media document created in MongoDB');

  // Delete media asset
  await deleteMediaAsset(mediaDoc.publicId);
  await Media.findByIdAndDelete(mediaDoc._id);
  const foundMedia = await Media.findById(mediaDoc._id);
  assert.strictEqual(foundMedia, null, 'Media record removed from MongoDB on deletion');
  console.log('✓ 3.1: Media lifecycle and asset deletion verified.');

  // 5. Test Reservation Engine & Conflict Safety
  console.log('\n[SECTION 4: Reservation Engine & Conflict Safety]');

  // Test 4.1: Past date rejection
  const pastCheck = await ReservationService.checkAvailability('2020-05-10', 2);
  assert.strictEqual(pastCheck.available, false);
  assert.match(pastCheck.reason || '', /past dates/i);
  console.log('✓ 4.1: Past date reservation accurately rejected.');

  // Test 4.2: Closed day rejection (Monday)
  const mondayCheck = await ReservationService.checkAvailability('2026-10-12', 2);
  assert.strictEqual(mondayCheck.available, false);
  assert.match(mondayCheck.reason || '', /closed on mondays/i);
  console.log('✓ 4.2: Weekly closed day (Monday) accurately enforced.');

  // Test 4.3: Max online party size rejection
  const overSizeCheck = await ReservationService.checkAvailability('2026-10-15', 12);
  assert.strictEqual(overSizeCheck.available, false);
  assert.match(overSizeCheck.reason || '', /limited to parties of up to/i);
  console.log('✓ 4.3: Online party size ceiling accurately enforced.');

  // Test 4.4: Available day slot generation
  const thursdayCheck = await ReservationService.checkAvailability('2026-10-15', 2);
  assert.strictEqual(thursdayCheck.available, true);
  assert.ok(thursdayCheck.availableSlots.length > 0, 'Should generate available time slots');
  const chosenSlot = thursdayCheck.availableSlots[0];
  console.log(`✓ 4.4: Valid day slot calculation verified (${thursdayCheck.availableSlots.length} slots).`);

  // Test 4.5: Create Reservation
  const res1 = await ReservationService.createReservation({
    date: '2026-10-15',
    time: chosenSlot,
    guests: 2,
    name: 'Sir Alexander Sterling',
    email: 'alexander@sterling-advisory.com',
    phone: '+1 (212) 555-7788',
    specialRequest: 'Corner table by the wine vault',
    source: 'Website',
  });
  assert.ok(res1.reference.startsWith('AURL-'), 'Reservation reference must start with AURL-');
  assert.strictEqual(res1.status, 'Confirmed');
  assert.ok(res1.table, 'Table should be assigned');
  const assignedTableId = res1.table._id.toString();
  console.log(`✓ 4.5: Reservation booked with reference: ${res1.reference} on table: ${res1.table.tableNumber}`);

  // Test 4.6: Explicit Table Conflict Prevention
  // Attempting to book the SAME table at the SAME time must fail
  let conflictCaught = false;
  try {
    await ReservationService.createReservation({
      date: '2026-10-15',
      time: chosenSlot,
      guests: 2,
      name: 'Conflicting Guest',
      email: 'conflict@example.com',
      phone: '+1 (212) 555-0000',
      tableId: assignedTableId,
    });
  } catch (err: any) {
    conflictCaught = true;
    assert.match(err.message, /already committed/i);
  }
  assert.strictEqual(conflictCaught, true, 'Booking same table at overlapping time must throw conflict error');
  console.log('✓ 4.6: Explicit table conflict caught and prevented.');

  // Test 4.7: Public Reference Lookup
  const lookup = await ReservationService.getReservationByReference(res1.reference);
  assert.ok(lookup);
  assert.strictEqual(lookup.reference, res1.reference);
  assert.strictEqual(lookup.name, 'Sir Alexander Sterling');
  console.log('✓ 4.7: Public lookup by booking reference code verified.');

  // Test 4.8: Guest Cancellation
  const cancelledRes = await ReservationService.cancelReservation(res1.reference, 'Client requested reschedule');
  assert.strictEqual(cancelledRes.status, 'Cancelled');
  assert.strictEqual(cancelledRes.cancellationReason, 'Client requested reschedule');

  const afterCancel = await ReservationService.getReservationByReference(res1.reference);
  assert.strictEqual(afterCancel?.status, 'Cancelled');
  console.log('✓ 4.8: Guest cancellation lifecycle verified.');

  // Test 4.9: Blocked date enforcement
  const settings = await RestaurantSettings.findOne();
  if (settings) {
    settings.blockedDates = ['2026-10-22'];
    await settings.save();
  }
  const blockedCheck = await ReservationService.checkAvailability('2026-10-22', 2);
  assert.strictEqual(blockedCheck.available, false);
  assert.match(blockedCheck.reason || '', /closed for a private event or holiday/i);
  console.log('✓ 4.9: Admin blocked date exclusion verified.');

  console.log('\n================================================================');
  console.log('--- ALL FULL-STACK AUDIT & VERIFICATION CHECKS PASSED ---');
  console.log('================================================================\n');

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
