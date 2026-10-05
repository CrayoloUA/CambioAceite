const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pad2, ymd, fromYMD, diffDays, formatLong, formatShort, fmtKm, haversineKm, addMonths
} = require('../js/utils.js');

test('pad2 rellena con cero a la izquierda', () => {
  assert.equal(pad2(5), '05');
  assert.equal(pad2(12), '12');
});

test('ymd formatea fecha en cambio de ano', () => {
  assert.equal(ymd(new Date(2025, 11, 31)), '2025-12-31');
});

test('fromYMD reconoce 29 de febrero en ano bisiesto', () => {
  const d = fromYMD('2024-02-29');
  assert.equal(d.getFullYear(), 2024);
  assert.equal(d.getMonth(), 1);
  assert.equal(d.getDate(), 29);
});

test('diffDays: mismo dia es 0', () => {
  const d = new Date(2025, 5, 10);
  assert.equal(diffDays(d, d), 0);
});

test('diffDays: cruza fin de mes', () => {
  assert.equal(diffDays(new Date(2025, 0, 31), new Date(2025, 1, 1)), 1);
});

test('diffDays: fechas invertidas da negativo', () => {
  assert.equal(diffDays(new Date(2025, 5, 10), new Date(2025, 5, 1)), -9);
});

test('addMonths cruza de diciembre a enero del ano siguiente', () => {
  const r = addMonths(new Date(2025, 11, 15), 1);
  assert.equal(r.getFullYear(), 2026);
  assert.equal(r.getMonth(), 0);
  assert.equal(r.getDate(), 15);
});

test('haversineKm: 1 grado de latitud es aproximadamente 111.2 km', () => {
  const d = haversineKm(0, 0, 0, 1);
  assert.ok(Math.abs(d - 111.19) < 0.5, `esperaba ~111.19 km, dio ${d}`);
});

test('fmtKm formatea con separador de miles es-CO', () => {
  assert.equal(fmtKm(15000), '15.000');
  assert.equal(fmtKm(999), '999');
});

test('formatLong y formatShort producen texto en espanol', () => {
  const d = new Date(2025, 0, 15);
  assert.equal(formatLong(d), 'miércoles, 15 de enero de 2025');
  assert.equal(formatShort(d), '15/01/2025');
});
