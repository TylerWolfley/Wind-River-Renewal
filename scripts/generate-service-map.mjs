// Static geographic map: one projection for every county boundary and place.
// No API keys, remote tiles, tracking, or runtime requests required.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/content/wyoming-map-data.json'), 'utf8'));
const project = ([lon, lat]) => [60 + (lon + 111.06) * 92, 80 + (45.01 - lat) * 92 / Math.cos(43 * Math.PI / 180)];
const point = coords => project(coords).map(n => n.toFixed(2)).join(',');
const geometryPath = geometry => {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap(polygon => polygon.map(ring => 'M' + ring.map(point).join('L') + 'Z')).join('');
};
const counties = data.counties.map(f => `<path class="county ${f.properties.GEOID === '56013' ? 'fremont' : f.properties.GEOID === '56025' ? 'natrona' : ''}" d="${geometryPath(f.geometry)}"><title>${f.properties.NAME}</title></path>`).join('\n');
const labels = {Dubois:[-10,-18,'end'],Riverton:[17,-14,'start'],Lander:[-14,34,'end'],Casper:[16,25,'start'],Cheyenne:[-12,-16,'end']};
const places = data.places.map(p => {
  const [x,y] = project([Number(p.CENTLON),Number(p.CENTLAT)]);
  const [dx,dy,anchor] = labels[p.BASENAME];
  return `<g class="place ${p.BASENAME === 'Cheyenne' ? 'context' : ''}"><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${p.BASENAME === 'Riverton' ? 8 : 6}"/><text x="${(x+dx).toFixed(2)}" y="${(y+dy).toFixed(2)}" text-anchor="${anchor}">${p.BASENAME}</text></g>`;
}).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 660" role="img" aria-labelledby="title desc">
<title id="title">Wyoming service area: Fremont and Natrona counties</title>
<desc id="desc">Geographic county boundaries across Wyoming. Fremont County is green and Natrona County is blue. Markers show Dubois, Riverton, Lander, and Casper. Riverton is our home base. Cheyenne is included for geographic context only. Coverage and scheduling are confirmed by address.</desc>
<style>
text{font-family:system-ui,-apple-system,Segoe UI,sans-serif}
.county{fill:#edf0f3;stroke:#c1cbd5;stroke-width:1.2;stroke-linejoin:round}
.fremont{fill:#d9eee6;stroke:#478775;stroke-width:2}
.natrona{fill:#d7e6fc;stroke:#3972bd;stroke-width:2}
.neighbor{font-size:17px;fill:#64748b;letter-spacing:2px;text-anchor:middle}
.state{font-size:28px;fill:#8995a4;font-weight:700;letter-spacing:7px;text-anchor:middle}
.county-name{font-size:19px;fill:#234e43;font-weight:700;letter-spacing:1px;text-anchor:middle;paint-order:stroke;stroke:#d9eee6;stroke-width:4px}
.county-name.blue{fill:#214b80;stroke:#d7e6fc}
.place circle{fill:#18365a;stroke:white;stroke-width:3}
.place text{font-size:24px;fill:#142b49;font-weight:750;paint-order:stroke;stroke:white;stroke-width:5px;stroke-linejoin:round}
.context circle{fill:#8b97a5}.context text{font-size:20px;fill:#657385;font-weight:500}
</style>
<text class="neighbor" x="380" y="42">MONTANA</text>
<text class="neighbor" transform="translate(27 310) rotate(-90)">IDAHO</text>
<text class="neighbor" x="150" y="627">UTAH</text><text class="neighbor" x="470" y="627">COLORADO</text>
<text class="neighbor" transform="translate(739 205) rotate(90)">SOUTH DAKOTA</text>
<text class="neighbor" transform="translate(739 470) rotate(90)">NEBRASKA</text>
${counties}
<text class="state" x="380" y="160">WYOMING</text>
<text class="county-name" x="255" y="410">FREMONT</text><text class="county-name blue" x="430" y="390">NATRONA</text>
${places}
<g transform="translate(655 128)" fill="#526174"><text x="0" y="-14" text-anchor="middle" font-size="16" font-weight="700">N</text><path d="M0 0L-6 17L0 13L6 17Z"/></g>
</svg>`;
fs.writeFileSync(path.join(root, 'assets/wyoming-service-area.svg'), svg);
console.log('Generated geographic Wyoming service map from Census data.');
