import assert from 'assert';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedInitialData } from '../src/server/seeds/seedData.js';
import { ReservationService } from '../src/server/services/reservation.service.js';
import { Reservation } from '../src/server/models/Reservation.js';
import { RestaurantSettings } from '../src/server/models/RestaurantSettings.js';
import { DiningTable } from '../src/server/models/DiningTable.js';

async function runTests() {
  console.log('--- Starting Aurelia Platform Verification Suite ---');

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test_aurelia' });
  await seedInitialData();

  console.log('✓ Database connected and seed data confirmed.');

  // Test 1: Past date rejection
  console.log('Test 1: Reject past date reservations');
  const pastAvailability = await ReservationService.checkAvailability('2020-01-01', 2);
  assert.strictEqual(pastAvailability.available, false);
  assert.match(pastAvailability.reason || '', /past dates/i);
  console.log('✓ Passed past date check');

  // Test 2: Party size exceeding online limit
  console.log('Test 2: Reject party size exceeding limit');
  const futureDate = '2026-10-15';
  const overCapacity = await ReservationService.checkAvailability(futureDate, 20);
  assert.strictEqual(overCapacity.available, false);
  assert.match(overCapacity.reason || '', /limited to parties of up to/i);
  console.log('✓ Passed party size ceiling check');

  // Test 3: Closed date check (Mondays are closed)
  console.log('Test 3: Reject closed day (Monday)');
  // 2026-10-12 is a Monday
  const mondayCheck = await ReservationService.checkAvailability('2026-10-12', 2);
  assert.strictEqual(mondayCheck.available, false);
  assert.match(mondayCheck.reason || '', /closed on mondays/i);
  console.log('✓ Passed closed day check');

  // Test 4: Available day slots generation
  console.log('Test 4: Available day returns time slots');
  // 2026-10-14 is a Wednesday
  const wedCheck = await ReservationService.checkAvailability('2026-10-14', 2);
  assert.strictEqual(wedCheck.available, true);
  assert.ok(wedCheck.availableSlots.length > 0);
  console.log(`✓ Passed available day check (${wedCheck.availableSlots.length} slots generated)`);

  // Test 5: Conflict-safe booking creation & reference generation
  console.log('Test 5: Create reservation and verify reference generation');
  const newRes = await ReservationService.createReservation({
    date: '2026-10-14',
    time: wedCheck.availableSlots[0],
    guests: 2,
    name: 'Lord Percival Graves',
    email: 'percival@graves-estate.co.uk',
    phone: '+44 20 7946 0912',
    specialRequest: 'Corner table by the courtyard window',
    source: 'Website',
  });
  assert.ok(newRes.reference.startsWith('AURL-'));
  assert.strictEqual(newRes.status, 'Confirmed');
  assert.ok(newRes.table);
  console.log(`✓ Passed booking creation with reference: ${newRes.reference}`);

  // Test 6: Public Reference Lookup
  console.log('Test 6: Public lookup by reference code');
  const lookup = await ReservationService.getReservationByReference(newRes.reference);
  assert.ok(lookup);
  assert.strictEqual(lookup.reference, newRes.reference);
  assert.strictEqual(lookup.name, 'Lord Percival Graves');
  console.log('✓ Passed reference lookup check');

  // Test 7: Cancellation by reference
  console.log('Test 7: Guest cancellation flow');
  const cancelled = await ReservationService.cancelReservation(newRes.reference, 'Schedule conflict', 'Guest');
  assert.strictEqual(cancelled.status, 'Cancelled');
  assert.strictEqual(cancelled.cancellationReason, 'Schedule conflict');

  const afterCancelLookup = await ReservationService.getReservationByReference(newRes.reference);
  assert.strictEqual(afterCancelLookup?.status, 'Cancelled');
  console.log('✓ Passed guest cancellation check');

  // Test 8: Blocked dates check
  console.log('Test 8: Admin blocked date prevents availability');
  const settings = await RestaurantSettings.findOne();
  if (settings) {
    settings.blockedDates.push('2026-10-20');
    await settings.save();
  }
  const blockedCheck = await ReservationService.checkAvailability('2026-10-20', 2);
  assert.strictEqual(blockedCheck.available, false);
  assert.match(blockedCheck.reason || '', /closed for a private event or holiday/i);
  console.log('✓ Passed blocked date check');

  console.log('--- ALL CRITICAL BUSINESS LOGIC TESTS PASSED ---');
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
