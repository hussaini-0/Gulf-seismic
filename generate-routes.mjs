import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'dist');
const slug = value => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const services = ['road-marking', 'thermoplastic-road-marking', 'parking-lot-marking', 'warehouse-marking', 'airport-marking', 'industrial-marking', 'safety-signage', 'epoxy-flooring'];
const industries = ['Highways & Roads', 'Commercial & Retail', 'Industrial & Manufacturing', 'Logistics & Warehousing', 'Aviation & Airports', 'Oil & Gas / Petrochemical', 'Residential & Communities', 'Healthcare & Institutional', 'Energy & Utilities', 'Retail & Showrooms'];
const projects = ['NMDC Abu Dhabi Helipad Marking', 'Al Geemi Abu Dhabi Airport Zone Marking Works', 'Al Ryum Abu Dhabi Event Plaza Al Falah Project Marking', 'Colorspot Abu Dhabi City Marking', 'GCCLD Al Ain Marking', 'GCCLD Al Ain / Access Adds Dubai Marking', 'Access Adds Dubai Marking', 'NIGM Abu Dhabi'];
const cities = { uae: ['Abu Dhabi','Dubai','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Al Ain','Umm Al Quwain'], 'saudi-arabia': ['Riyadh','Jeddah','Dammam','Al Khobar','Jubail','Yanbu','Makkah','Madinah'] };
const cityRoutes = Object.entries(cities).flatMap(([country,list])=>list.map(x=>`${country}/${x==='Al Khobar'?'khobar':slug(x)}`));
const routes = ['about','contact','projects','industries','blog','services','uae','saudi-arabia','blog/thermoplastic-road-markings-uae','blog/car-park-surfacing-uae',...services.map(x=>`services/${x}`),...industries.map(x=>`industries/${slug(x)}`),...projects.map(x=>`projects/${slug(x)}`),...cityRoutes,...cityRoutes.flatMap(city=>services.map(service=>`${city}/${service}`))];
for (const route of routes) {
  const dir = join(root, route);
  await mkdir(dir, { recursive: true });
  await copyFile(join(root, 'index.html'), join(dir, 'index.html'));
}
console.log(`Prepared ${routes.length} static routes.`);
