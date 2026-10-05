function calcularProximaFecha({ last, history, kmUmbral, mesesUmbral }){
  if(!last) return null;

  const lastDate = fromYMD(last.date);
  const porMeses = addMonths(lastDate, mesesUmbral);

  const hist = (history || []).slice().sort((a,b) => fromYMD(a.date)-fromYMD(b.date));
  let porKm = null;
  if(hist.length >= 2){
    const primero = hist[0], ultimo = hist[hist.length-1];
    const dias = diffDays(fromYMD(primero.date), fromYMD(ultimo.date));
    const kmRecorridos = Number(ultimo.mileage) - Number(primero.mileage);
    if(dias > 0 && kmRecorridos > 0){
      const kmPorDia = kmRecorridos / dias;
      const diasParaUmbral = Math.ceil(kmUmbral / kmPorDia);
      porKm = new Date(lastDate);
      porKm.setDate(porKm.getDate() + diasParaUmbral);
    }
  }

  return (porKm && porKm.getTime() < porMeses.getTime()) ? porKm : porMeses;
}

function calcularEstadoKm(delta, kmUmbral){
  const pct = (delta/kmUmbral)*100;
  const falta = kmUmbral - delta;

  if(delta >= kmUmbral){
    return {
      nivel: 'late',
      texto: '¡Hay que cambiar el aceite!',
      detalle: `${fmtKm(delta)} km recorridos · ${fmtKm(delta-kmUmbral)} km de exceso`,
      pct: 100
    };
  } else if(pct >= 60){
    return {
      nivel: 'warn',
      texto: `Pronto toca cambio — faltan ${fmtKm(falta)} km`,
      detalle: `${fmtKm(delta)} km recorridos · ${fmtKm(falta)} km restantes`,
      pct
    };
  } else {
    return {
      nivel: 'ok',
      texto: `Todo bien — faltan ${fmtKm(falta)} km`,
      detalle: `${fmtKm(delta)} km recorridos · ${fmtKm(falta)} km restantes`,
      pct
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcularProximaFecha, calcularEstadoKm };
}
