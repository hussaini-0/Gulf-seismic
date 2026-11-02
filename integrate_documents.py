"""Integrate client-provided PDFs into the mirrored static Gulf Seismic site.

Run after mirror-site.mjs. The PDFs stay in dist/downloads after the initial copy,
so a checkout without the original Downloads directory can still reapply links.
"""

from pathlib import Path
from copy import deepcopy
from html import escape
import shutil
from lxml import html, etree
from pypdf import PdfReader

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
SOURCE = Path(r"C:\Users\ASUS\Downloads")

# Category, source file, public filename, title, context.
DOCS = [
    ("Company profiles", "GSGC Corporate Profile.pdf", "gsgc-corporate-profile.pdf", "Gulf Seismic corporate profile", "Field services, contracting support, workforce solutions and road marking."),
    ("Company profiles", "GSGC_Company_Profile_Industrial Supply & Equipment Solutions.pdf", "gsgc-industrial-supply-equipment-profile.pdf", "Industrial supply & equipment profile", "Six supply and project-support divisions."),
    ("UAE road marking", "GSGC Road Marking Profile.pdf", "gsgc-road-marking-profile.pdf", "UAE road-marking company profile", "Gulf Seismic road-marking capability overview."),
    ("UAE road marking", "GSGC Road Marking Flyer .pdf", "gsgc-road-marking-flyer.pdf", "UAE road-marking flyer", "Quick overview of road-marking services."),
    ("UAE road marking", "GSGC Road Marking Brochure..pdf", "gsgc-road-marking-brochure.pdf", "UAE road-marking brochure", "Detailed road-marking services and applications."),
    ("Saudi road marking", "SCC Road Marking Company Profile.pdf", "scc-saudi-road-marking-profile.pdf", "Saudi road-marking company profile", "Seismic Contracting Company LLC; a separate Saudi legal entity."),
    ("Saudi road marking", "SCC RM-Flyer.pdf", "scc-saudi-road-marking-flyer.pdf", "Saudi road-marking flyer", "Seismic Contracting Company LLC road-marking summary."),
    ("Saudi road marking", "SCC RM- Brochure.pdf", "scc-saudi-road-marking-brochure.pdf", "Saudi road-marking brochure", "Seismic Contracting Company LLC road-marking applications."),
    ("Project photo reports", "Tornado_Al_Mirfa_Project_Photo_Report_Regenerated.pdf", "project-tornado-al-mirfa-photo-report.pdf", "Tornado — Al Mirfa Marine Management Center", "Road marking and signage installation; 27 site photos."),
    ("Project photo reports", "Emarat_Abu_Dhabi_Project_Photo_Report.pdf", "project-emarat-abu-dhabi-photo-report.pdf", "Emarat — Abu Dhabi", "Painting of road markers and lines; 1 site photo."),
    ("Project photo reports", "Shine_Square_Jubail_Island_Project_Photo_Report.pdf", "project-shine-square-jubail-island-photo-report.pdf", "Shine Square — Jubail Island", "Road marking and signage installation; 11 site photos."),
    ("Project photo reports", "NIGM_ADNOC_Site_Project_Photo_Report.pdf", "project-nigm-adnoc-site-photo-report.pdf", "NIGM — ADNOC Site", "Road and parking marking; 5 site photos."),
    ("Project photo reports", "GCCLD_Al_Ain_Road_Marking_Works_Project_Photo_Report.pdf", "project-gccld-al-ain-photo-report.pdf", "GCCLD — Al Ain", "Road-marking works; 24 site photos."),
    ("Project photo reports", "Dubai_Airport_Runway_Marking_Project_Photo_Report.pdf", "project-dubai-airport-runway-photo-report.pdf", "Dubai Airport — runway marking", "Runway-marking works; client not stated in the report."),
    ("Project photo reports", "Al_Ryum_Event_Plaza_Al_Falah_Project_Photo_Report.pdf", "project-al-ryum-event-plaza-photo-report.pdf", "Al Ryum — Event Plaza, Al Falah", "Road and surface marking; 7 site photos."),
    ("Project photo reports", "Colorspot_Abu_Dhabi_City_Project_Photo_Report.pdf", "project-colorspot-abu-dhabi-photo-report.pdf", "Colorspot — Abu Dhabi City", "Road and parking marking; 14 site photos."),
    ("Project photo reports", "NMDC_Abu_Dhabi_Helipad_Project_Photo_Report.pdf", "project-nmdc-abu-dhabi-helipad-photo-report.pdf", "NMDC — Abu Dhabi helipad", "Helipad-marking works; 4 site photos."),
    ("Project photo reports", "Al_Geemi_Abu_Dhabi_Airport_Zone_Project_Photo_Report.pdf", "project-al-geemi-airport-zone-photo-report.pdf", "Al Geemi — Abu Dhabi Airport Zone", "Road-marking works; 5 site photos."),
    ("Project photo reports", "ADICC-Yacht Club, Abu Dhabi Road Marking Works  .pdf", "project-adicc-yacht-club-photo-report.pdf", "ADICC — The Yacht Club, Abu Dhabi", "Road-marking works; dated 19 September 2026."),
    ("Project photo reports", "Access_Adds_Dubai_Road_Marking_Works_Project_Photo_Report.pdf", "project-access-adds-dubai-photo-report.pdf", "Access Adds — Dubai", "Road-marking works; 5 site photos."),
    ("Certifications", "ISO 9001.pdf", "gsgc-iso-9001-certificate.pdf", "ISO 9001:2015", "Quality management systems certificate."),
    ("Certifications", "ISO 14001.pdf", "gsgc-iso-14001-certificate.pdf", "ISO 14001:2015", "Environmental management systems certificate."),
]

CATEGORY_TEXT = {
    "Company profiles": "Core Gulf Seismic capability documents.",
    "UAE road marking": "Gulf Seismic General Contracting L.L.C. road-marking materials for the UAE.",
    "Saudi road marking": "Materials branded for Seismic Contracting Company LLC, the separately named Saudi business referenced on this site.",
    "Project photo reports": "Client-supplied photographic records. Titles describe the report; they do not independently verify project ownership or completion.",
    "Certifications": "Issued to Gulf Seismic General Contracting LLC. Verify current standing with the issuer before relying on a certificate.",
}


def add_fragment(parent, fragment):
    for node in html.fragments_fromstring(fragment):
        parent.append(node)


def render_page():
    tree = html.parse(str(DIST / "about" / "index.html"))
    doc = tree.getroot()
    head = doc.find("head")
    head.xpath("./title")[0].text = "Gulf Seismic Resources | Profiles, Reports & Certificates"
    for meta in head.xpath('./meta[@name="description"]'):
        meta.set("content", "Explore Gulf Seismic company profiles, UAE and Saudi road-marking brochures, project photo reports, and ISO certificates.")
    for link in head.xpath('./link[@rel="canonical"]'):
        link.set("href", "https://gulfseismic.com/documents")
    if not head.xpath('./link[@href="/documents.css"]'):
        head.append(etree.Element("link", rel="stylesheet", href="/documents.css"))
    main = doc.xpath("//main")[0]
    main.clear()
    main.set("class", "docs-main")
    add_fragment(main, """
      <section class="docs-hero">
        <div class="docs-wrap">
          <nav class="docs-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Resources</span></nav>
          <span class="docs-eyebrow">RESOURCE LIBRARY</span>
          <h1>Gulf Seismic Resources</h1>
          <p>Company profiles, road-marking literature, project photo reports and certificates — organized by business and purpose.</p>
        </div>
      </section>
      <section class="docs-intro"><div class="docs-wrap">
        <p>The Saudi materials are branded for <strong>Seismic Contracting Company LLC</strong>, not the UAE legal entity. The project reports are photographic records supplied for this library; check the PDF for its stated client, site and scope.</p>
      </div></section>
    """)
    categories = list(dict.fromkeys(row[0] for row in DOCS))
    for category in categories:
        anchor = category.lower().replace(" ", "-")
        section = etree.SubElement(main, "section", {"class": "docs-section", "id": anchor})
        wrap = etree.SubElement(section, "div", {"class": "docs-wrap"})
        add_fragment(wrap, f'<div class="docs-heading"><span class="docs-kicker">RESOURCE LIBRARY</span><h2>{escape(category)}</h2><p>{escape(CATEGORY_TEXT[category])}</p></div>')
        grid = etree.SubElement(wrap, "div", {"class": "docs-grid"})
        for cat, source, filename, title, context in DOCS:
            if cat != category:
                continue
            path = DIST / "downloads" / filename
            pages = len(PdfReader(path).pages)
            size = path.stat().st_size / (1024 * 1024)
            href = f"/downloads/{filename}"
            add_fragment(grid, f"""
              <article class="docs-card">
                <span class="docs-file-icon" aria-hidden="true">PDF</span>
                <div class="docs-card-body">
                  <h3>{escape(title)}</h3>
                  <p>{escape(context)}</p>
                  <span class="docs-meta">{pages} {'page' if pages == 1 else 'pages'} · {size:.1f} MB</span>
                </div>
                <a href="{href}" target="_blank" rel="noopener noreferrer" aria-label="Open {escape(title)} PDF">Open PDF <span aria-hidden="true">↗</span></a>
              </article>
            """)
    add_fragment(main, '<section class="docs-cta"><div class="docs-wrap"><h2>Need a project-specific document?</h2><p>Contact our team for a scope-matched capability pack or quotation.</p><a href="/contact">Contact Gulf Seismic →</a></div></section>')
    output = DIST / "documents" / "index.html"
    output.parent.mkdir(exist_ok=True)
    output.write_bytes(etree.tostring(doc, method="html", encoding="utf-8", doctype="<!DOCTYPE html>"))


def modify_pages():
    for path in DIST.rglob("index.html"):
        tree = html.parse(str(path))
        doc = tree.getroot()
        changed = False
        for link in doc.xpath('//header//a[@href="/documents"] | //footer//a[@href="/documents"]'):
            if link.text != "Resources":
                link.text = "Resources"
                changed = True
        for link in doc.xpath('//header//a[@href="/projects"]'):
            if link.getparent() is not None and not link.getparent().xpath('./a[@href="/documents"]'):
                new = deepcopy(link)
                new.set("href", "/documents")
                new.text = "Resources"
                link.addnext(new)
                changed = True
        for link in doc.xpath('//footer//a[@href="/projects"]'):
            item = link.getparent()
            if item is not None and item.tag == "li":
                for misplaced in item.xpath('./a[@href="/documents"]'):
                    item.remove(misplaced)
                    changed = True
            if item is not None and item.tag == "li" and not item.getparent().xpath('./li/a[@href="/documents"]'):
                new = deepcopy(link)
                new.set("href", "/documents")
                new.text = "Resources"
                new_item = etree.Element("li")
                new_item.append(new)
                item.addnext(new_item)
                changed = True
        for section in doc.xpath('//*[@data-document-integration]'):
            section.getparent().remove(section)
            changed = True
        # The supplied ISO 45001 image names a non-existent 2015 edition;
        # withhold the pre-existing footer claim until a corrected document arrives.
        for badge in doc.xpath('//footer//span[normalize-space(.)="ISO 45001:2018"]'):
            badge.getparent().remove(badge)
            changed = True
        if path == DIST / "about" / "index.html":
            main = doc.xpath("//main")[0]
            add_fragment(main, '<section data-document-integration="profiles" class="docs-inline-section"><div class="docs-wrap"><span class="docs-kicker">COMPANY RESOURCES</span><h2>Explore our company resources</h2><p>Review Gulf Seismic’s corporate profile, road-marking literature and ISO certificates in one place.</p><a href="/documents">Browse resources →</a></div></section>')
            if not doc.find("head").xpath('./link[@href="/documents.css"]'):
                doc.find("head").append(etree.Element("link", rel="stylesheet", href="/documents.css"))
            changed = True
        if path == DIST / "projects" / "index.html":
            main = doc.xpath("//main")[0]
            add_fragment(main, '<section data-document-integration="reports" class="docs-inline-section"><div class="docs-wrap"><span class="docs-kicker">PROJECT EVIDENCE</span><h2>More project photo reports</h2><p>View the full set of supplied road, airport, helipad and signage photo reports.</p><a href="/documents#project-photo-reports">Browse all 12 photo reports →</a></div></section>')
            if not doc.find("head").xpath('./link[@href="/documents.css"]'):
                doc.find("head").append(etree.Element("link", rel="stylesheet", href="/documents.css"))
            changed = True
        if path == DIST / "saudi-arabia" / "index.html":
            main = doc.xpath("//main")[0]
            add_fragment(main, '<section data-document-integration="saudi" class="docs-inline-section"><div class="docs-wrap"><span class="docs-kicker">SAUDI RESOURCES</span><h2>Saudi road-marking capability</h2><p>Download the Seismic Contracting Company LLC profile, flyer and brochure.</p><a href="/documents#saudi-road-marking">View Saudi resources →</a></div></section>')
            if not doc.find("head").xpath('./link[@href="/documents.css"]'):
                doc.find("head").append(etree.Element("link", rel="stylesheet", href="/documents.css"))
            changed = True
        if path == DIST / "services" / "industrial-supplies-abu-dhabi-uae" / "index.html":
            main = doc.xpath("//main")[0]
            add_fragment(main, '<section data-document-integration="supply" class="docs-inline-section"><div class="docs-wrap"><span class="docs-kicker">SUPPLY PROFILE</span><h2>Industrial supply &amp; equipment solutions</h2><p>Download the full capability profile for Gulf Seismic’s industrial-supply divisions.</p><a href="/downloads/gsgc-industrial-supply-equipment-profile.pdf" target="_blank" rel="noopener noreferrer">Open company profile PDF ↗</a></div></section>')
            if not doc.find("head").xpath('./link[@href="/documents.css"]'):
                doc.find("head").append(etree.Element("link", rel="stylesheet", href="/documents.css"))
            changed = True
        project_links = {
            "access-adds-dubai-marking": "project-access-adds-dubai-photo-report.pdf",
            "al-geemi-abu-dhabi-airport-zone-marking": "project-al-geemi-airport-zone-photo-report.pdf",
            "al-ryum-abu-dhabi-event-plaza-al-falah-marking": "project-al-ryum-event-plaza-photo-report.pdf",
            "colorspot-abu-dhabi-city-marking": "project-colorspot-abu-dhabi-photo-report.pdf",
            "gccld-al-ain-marking": "project-gccld-al-ain-photo-report.pdf",
            "nigm-abu-dhabi-marking": "project-nigm-adnoc-site-photo-report.pdf",
            "nmdc-abu-dhabi-helipad-marking": "project-nmdc-abu-dhabi-helipad-photo-report.pdf",
        }
        if path.parent.name in project_links and path.parent.parent.name == "projects":
            for link in doc.xpath('//a[contains(@href, ".pdf")]'):
                link.set("href", "/downloads/" + project_links[path.parent.name])
                if len(link):
                    link[-1].tail = "Project photo report (PDF)"
                else:
                    link.text = "Project photo report (PDF)"
                changed = True
        if changed:
            path.write_bytes(etree.tostring(doc, method="html", encoding="utf-8", doctype="<!DOCTYPE html>"))


def main():
    downloads = DIST / "downloads"
    for _, original, public, _, _ in DOCS:
        target = downloads / public
        source = SOURCE / original
        if source.exists():
            shutil.copy2(source, target)
        elif not target.exists():
            raise FileNotFoundError(source)
    render_page()
    modify_pages()
    sitemap = DIST / "sitemap.xml"
    content = sitemap.read_text(encoding="utf-8")
    if "https://gulfseismic.com/documents" not in content:
        content = content.replace("</urlset>", "  <url><loc>https://gulfseismic.com/documents</loc></url>\n</urlset>")
        sitemap.write_text(content, encoding="utf-8")
    print(f"Integrated {len(DOCS)} PDFs; created /documents; updated navigation and contextual links.")


if __name__ == "__main__":
    main()
