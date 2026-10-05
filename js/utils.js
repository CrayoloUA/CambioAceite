const pad2 = n => String(n).padStart(2,'0');
const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const fromYMD = s => { const [y,m,da]=s.split('-').map(Number); return new Date(y,m-1,da); };
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a,b) => Math.floor((startOfDay(b)-startOfDay(a))/86400000);
const formatLong = d => new Intl.DateTimeFormat('es-CO',{dateStyle:'full'}).format(d);
const formatShort = d => new Intl.DateTimeFormat('es-CO',{dateStyle:'medium'}).format(d);
const fmtKm = n => new Intl.NumberFormat('es-CO').format(Math.round(n));

function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371, toRad = x => x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.asin(Math.sqrt(a));
}

const addMonths = (d,n) => { const r=new Date(d); r.setMonth(r.getMonth()+n); return r; };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pad2, ymd, fromYMD, startOfDay, diffDays, formatLong, formatShort, fmtKm, haversineKm, addMonths };
}
