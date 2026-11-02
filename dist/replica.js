(() => {
  const uae = ['Abu Dhabi','Dubai','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Al Ain','Umm Al Quwain'];
  const saudi = ['Riyadh','Jeddah','Dammam','Al Khobar','Jubail','Yanbu','Makkah','Madinah'];
  const services = ['Road Marking','Thermoplastic Road Marking','Parking Lot Marking','Warehouse Marking','Airport Marking','Industrial Marking','Safety Signage','Epoxy Flooring'];
  const faqAnswers = {
    'road-marking': [
      'Service life depends on traffic volume, surface condition, material grade and climate. We advise expected life for your site once scope and materials are confirmed — high-stress intersections usually need earlier maintenance.',
      'Hot thermoplastic typically reaches traffic-ready condition within minutes under normal Gulf night-shift temperatures. Exact reopen times are confirmed on site against the approved method statement.',
      'We execute to the specification named in each tender or purchase order. Where RTA (UAE) or MOMRA (Saudi Arabia) drawings apply, line widths, colours, reflectivity and materials follow those documents — verified per project requirements.'
    ],
    'thermoplastic-road-marking': [
      'Thermoplastic is heated to 180–200°C in an oil-jacketed kettle and applied at 170–190°C to ensure proper fusion with the substrate.',
      'No. Existing paint must be removed by water-blasting or mechanical scarifying so the thermoplastic fuses directly with the asphalt or concrete.',
      'Yes, with a compatible epoxy or solvent primer applied first to promote adhesion between the thermoplastic and the concrete.'
    ],
    'parking-lot-marking': [
      'A typical 200-bay parking lot is marked in 1–2 days. We work in phases to keep portions of the facility open throughout.',
      'We recommend blacking out ghost lines first to avoid driver confusion. Where layout changes, old lines are obscured with black-out paint before new marking.',
      'Yes, we apply all accessibility symbols, bay dimensions and signage to meet local and international accessibility codes.'
    ],
    'warehouse-marking': [
      'Epoxy marking typically lasts 2–4 years under moderate forklift traffic; polyurea systems can last 4–6 years in high-traffic aisles.',
      'Yes, after mechanical grinding or shot-blasting to profile the surface and ensure epoxy adhesion. We always test coating compatibility first.',
      'Polyurea systems cure in 1–2 hours, allowing phased application with minimal downtime. Epoxy requires 12–24 hours before traffic.'
    ],
    'airport-marking': [
      'Yes. All runway, taxiway and apron markings follow ICAO Annex 14 dimensions, colours and reflectivity, with Type III MMA systems for durability.',
      'MMA cold plastic cures in 30–45 minutes, allowing markings to be applied and reopened within a single night-shift NOTAM window.',
      "Yes. All airside personnel hold valid airside driving permits and follow the airport's safety management system (SMS)."
    ],
    'industrial-marking': [
      'Novolac epoxy and polyurea systems resist oils, fuels, acids and alkalis. We select the chemistry based on the specific chemicals present in your facility.',
      'Yes. We apply colour-coded pipe banding and valve identification to ASME A13.1 / local standards for complete plant identification.',
      'For surfaces up to 120°C we use polyurea; for higher temperatures near furnaces we apply high-temperature silicone-based marking systems.'
    ],
    'safety-signage': [
      'Yes. All hazard, mandatory, prohibition and emergency signs use ISO 7010 standard pictograms with the correct colour and shape coding.',
      'For urban roads we recommend Type III high-intensity prismatic; for highways and high-speed roads, Type IV diamond-grade for maximum night visibility.',
      'Yes. We design and manufacture complete custom wayfinding systems including directional, identification and informational signage with your brand.'
    ],
    'epoxy-flooring': [
      'A properly installed epoxy floor lasts 10–15 years in commercial environments and 5–10 years in heavy-industrial settings before requiring recoating.',
      'We test moisture vapour transmission first. For damp slabs we use moisture-mitigating primers or polyurea systems that tolerate higher vapour pressure.',
      'Light foot traffic after 12–24 hours; light vehicle traffic after 48 hours; full chemical/heavy traffic after 7 days for full cure.'
    ]
  };
  const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const linkList = (items, base) => items.map(item => `<a href="/${base}/${item === 'Al Khobar' ? 'khobar' : slug(item)}">${item}</a>`).join('');
  const menuButton = document.querySelector('[data-slot="sheet-trigger"]');
  if (menuButton) {
    const overlay = document.createElement('div');
    overlay.className = 'replica-menu';
    overlay.hidden = true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-label','Navigation menu');
    overlay.innerHTML = `<div class="replica-menu-panel"><div class="replica-menu-top"><strong>Gulf Seismic</strong><button type="button" aria-label="Close menu">×</button></div><nav><a href="/services">All Services</a><a href="/projects">Projects</a><a href="/industries">Industries</a><a href="/blog">Blog</a><a href="/about">About</a><a href="/contact">Get a Quote</a></nav><h3>🇦🇪 UAE</h3><div class="replica-menu-cities">${linkList(uae,'uae')}</div><h3>🇸🇦 Saudi Arabia</h3><div class="replica-menu-cities">${linkList(saudi,'saudi-arabia')}</div></div>`;
    document.body.append(overlay);
    const close = () => { overlay.hidden = true; menuButton.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
    menuButton.addEventListener('click', () => { overlay.hidden = false; menuButton.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; overlay.querySelector('button').focus(); });
    overlay.querySelector('button').addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
  }

  for (const form of document.querySelectorAll('form')) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) continue;
    const triggers = [...form.querySelectorAll('[data-slot="select-trigger"]')];
    form.querySelectorAll('select[aria-hidden="true"]').forEach(select => select.remove());
    const choices = [
      { name:'country', placeholder:'Select country', options:['🇦🇪 UAE','🇸🇦 Saudi Arabia'] },
      { name:'city', placeholder:'Select city', options:[] },
      { name:'service', placeholder:'Select service', options:services }
    ];
    triggers.forEach((trigger, index) => {
      const choice = choices[index];
      if (!choice) return;
      const select = document.createElement('select');
      select.name = choice.name;
      select.className = 'replica-select';
      select.setAttribute('aria-label', choice.name[0].toUpperCase()+choice.name.slice(1));
      select.innerHTML = `<option value="">${choice.placeholder}</option>` + choice.options.map(item=>`<option value="${item}">${item}</option>`).join('');
      trigger.replaceWith(select);
    });
    const country = form.elements.namedItem('country');
    const city = form.elements.namedItem('city');
    if (country && city) country.addEventListener('change', () => {
      const cities = country.value.includes('UAE') ? uae : country.value.includes('Saudi') ? saudi : [];
      city.innerHTML = '<option value="">Select city</option>' + cities.map(item=>`<option>${item}</option>`).join('');
    });
    for (const name of ['name','email','phone','message']) {
      const field = form.elements.namedItem(name);
      if (field) field.required = true;
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const body = [
        `Full Name: ${data.get('name') || ''}`,
        `Company: ${data.get('company') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Phone / WhatsApp: ${data.get('phone') || ''}`,
        `Country: ${data.get('country') || ''}`,
        `City: ${data.get('city') || ''}`,
        `Service: ${data.get('service') || ''}`,
        '',
        `Project Details: ${data.get('message') || ''}`
      ].join('\n');
      const status = document.createElement('p');
      status.className = 'replica-form-status';
      status.setAttribute('role','status');
      status.textContent = 'Your email app will open with the quote request ready to send.';
      form.querySelector('.replica-form-status')?.remove();
      button.after(status);
      window.location.href = `mailto:roadmarking@gulfseismic.com?subject=${encodeURIComponent('Gulf Seismic quote request')}&body=${encodeURIComponent(body)}`;
    });
  }

  const faqPage = location.pathname.split('/').filter(Boolean).at(-1);
  for (const [index,trigger] of [...document.querySelectorAll('[data-slot="accordion-trigger"]')].entries()) {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('[data-slot="accordion-item"]');
      const content = item?.querySelector('[data-slot="accordion-content"]');
      if (!content) return;
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!open));
      trigger.dataset.state = open ? 'closed' : 'open';
      item.dataset.state = open ? 'closed' : 'open';
      content.dataset.state = open ? 'closed' : 'open';
      content.hidden = open;
      if (!open && !content.textContent.trim()) {
        content.innerHTML = `<div class="pb-4 text-muted-foreground">${faqAnswers[faqPage]?.[index] || 'Contact Gulf Seismic for site-specific guidance.'}</div>`;
      }
    });
  }

  if (location.pathname.replace(/\/$/,'') === '/blog') {
    const category = new URLSearchParams(location.search).get('category');
    const cards = [...document.querySelectorAll('main a.group.block.h-full')];
    const categories = {
      '/blog/thermoplastic-road-markings-uae':'Technical Guide',
      '/blog/car-park-surfacing-uae':'Commercial'
    };
    let count = 0;
    for (const card of cards) {
      const visible = !category || categories[card.getAttribute('href')] === category;
      card.hidden = !visible;
      if (visible) count++;
    }
    for (const filter of document.querySelectorAll('main a[href^="/blog?category="], main a[href="/blog"]')) {
      const selected = new URL(filter.href).searchParams.get('category') === category;
      filter.classList.toggle('border-amber-brand', selected);
      filter.classList.toggle('bg-amber-brand', selected);
      filter.classList.toggle('text-amber-foreground', selected);
    }
    if (!count && cards.length) {
      const empty = document.createElement('div');
      empty.className = 'replica-blog-empty';
      empty.innerHTML = '<h3>No posts yet</h3><p>Blog posts will appear here once published from the admin panel.</p>';
      cards[0].parentElement.after(empty);
    }
  }

  const whatsapp = document.querySelector('button[aria-label="Open WhatsApp chat"]');
  if (whatsapp) {
    const holder = whatsapp.parentElement;
    const reveal = () => { if (scrollY > 350) { holder.classList.remove('pointer-events-none','translate-y-4','opacity-0'); holder.classList.add('opacity-100'); } else { holder.classList.add('pointer-events-none','translate-y-4','opacity-0'); holder.classList.remove('opacity-100'); } };
    addEventListener('scroll',reveal,{passive:true}); reveal();
    whatsapp.addEventListener('click', () => window.open('https://wa.me/971549970833?text=Hello%20Gulf%20Seismic,%20I%20would%20like%20a%20quote.','_blank','noopener'));
  }
})();
