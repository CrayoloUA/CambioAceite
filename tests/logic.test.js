const test = require('node:test');
const assert = require('node:assert/strict');

// js/logic.js espera pad2/fromYMD/addMonths/diffDays/fmtKm como globales
// (igual que en el navegador, donde js/utils.js se carga antes). En Node
// las copiamos al global antes de requerir logic.js.
const utils = require('../js/utils.js');
Object.assign(global, utils);

const { calcularProximaFecha, calcularEstadoKm } = require('../js/logic.js');

test('calcularProximaFecha: sin ultimo cambio devuelve null', () => {
  assert.equal(calcularProximaFecha({ last: null, history: [], kmUmbral: 3000, mesesUmbral: 6 }), null);
});

test('calcularProximaFecha: con menos de 2 registros usa el tope por meses', () => {
  const r = calcularProximaFecha({
    last: { date: '2025-01-15', mileage: 10000 },
    history: [{ date: '2025-01-15', mileage: 10000 }],
    kmUmbral: 3000,
    mesesUmbral: 6
  });
  assert.equal(r.toISOString().slice(0, 10), '2025-07-15');
});

test('calcularProximaFecha: con ritmo rapido, la proyeccion por km gana', () => {
  const r = calcularProximaFecha({
    last: { date: '2025-01-01', mileage: 10000 },
    history: [
      { date: '2025-01-01', mileage: 10000 },
      { date: '2025-01-11', mileage: 10300 }
    ],
    kmUmbral: 3000,
    mesesUmbral: 6
  });
  assert.equal(r.toISOString().slice(0, 10), '2025-04-11');
});

test('calcularEstadoKm: delta 0 es ok', () => {
  const r = calcularEstadoKm(0, 3000);
  assert.equal(r.nivel, 'ok');
  assert.equal(r.pct, 0);
  assert.equal(r.detalle, '0 km recorridos · 3.000 km restantes');
});

test('calcularEstadoKm: delta en 66% es warn', () => {
  const r = calcularEstadoKm(2000, 3000);
  assert.equal(r.nivel, 'warn');
  assert.equal(r.texto, 'Pronto toca cambio — faltan 1.000 km');
});

test('calcularEstadoKm: delta por encima del umbral es late con el exceso', () => {
  const r = calcularEstadoKm(3500, 3000);
  assert.equal(r.nivel, 'late');
  assert.equal(r.detalle, '3.500 km recorridos · 500 km de exceso');
  assert.equal(r.pct, 100);
});
