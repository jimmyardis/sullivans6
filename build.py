"""Assemble index.html and history.html from the templates, then copy the
images they reference from the Codex/Antigravity source folder."""
import re, shutil, pathlib, html

SRC = pathlib.Path('/mnt/c/Users/Owner/Documents/Vince/sullivans2')
HERE = pathlib.Path(__file__).parent

GALLERY = """castlefromkeep keepx2 keepx4 keepx5 keepx8 keepx10 keepgreatroom2 keepn4 keepn6 keepn7
keepn9 keepstars MBed_8530p WH_8812p dh9560 dh8931 castlen3 castlen4 castlen5 castlen7 castlen11
castlen13 castlen14 castlen15 castlen16 castlen20 castlen22 castlen23 castlen24 castlen25 caslten8
casltex7 keeproof2 keeproof3 keeproof4 keepn17 keepn18 keepn19 keepn20 keepn21 keepn22 keepn23
keepn28 keepn29 keepx11 keepx12 keepx13 keepx14 keepx15 keepx16""".split()

def alt(name):
    kind = ('The keep' if name.startswith('keep') else
            'The chapel' if name.startswith(('castle', 'caslte', 'caslten', 'casltex')) else
            'Fort Sullivan')
    return f'{kind} — photograph {GALLERY.index(name) + 1}'

gallery = '\n'.join(
    f'            <figure><button type="button" data-full="{n}.webp" data-group="estate">'
    f'<img src="{n}.webp" alt="{html.escape(alt(n))}" loading="lazy"></button></figure>'
    for n in GALLERY)

FOOTER = """    <footer class="site-footer">
        <div class="footer-inner container">
            <div class="footer-seal-row">
                <img src="Mugdock.jpg" alt="Mugdock seal" class="footer-seal" loading="lazy">
                <img src="Castle - Dale Watson Drawing.jpg" alt="Architectural drawing of the castle by Dale Watson" class="footer-drawing" loading="lazy">
            </div>
            <div class="footer-body">
                <h3 class="footer-name">Fort Sullivan</h3>
                <p class="footer-addr">1401 Middle Street &nbsp;·&nbsp; Sullivan's Island, South Carolina</p>
                <p class="footer-copy">Est. 1891 · Chapel of the Holy Cross · W. W. Deveaux, Architect</p>
                <p class="footer-copy"><a href="index.html" style="color:inherit">The Castle</a> · <a href="history.html" style="color:inherit">The History</a></p>
            </div>
            <img src="sword.webp" alt="" class="footer-sword" loading="lazy">
        </div>
    </footer>"""

LIGHTBOX = """    <dialog class="lightbox" aria-label="Photograph viewer">
        <div class="lightbox-inner">
            <img src="" alt="">
            <div class="lightbox-bar">
                <button type="button" class="lightbox-prev" aria-label="Previous photograph">←</button>
                <span class="lightbox-count" aria-live="polite"></span>
                <span class="lightbox-caption" hidden></span>
                <button type="button" class="lightbox-next" aria-label="Next photograph">→</button>
            </div>
        </div>
        <button type="button" class="lightbox-close" aria-label="Close">×</button>
    </dialog>"""

archive = (HERE / 'archive.part.html').read_text()
archive = archive.replace('<p class="archive-sub">135 years of accumulation. Drag to excavate.</p>',
                          '<p class="archive-sub">135 years of accumulation. Drag to excavate · hover or tab to surface a card.</p>')

pages = {
    'index.html': (HERE / 'index.tpl.html').read_text()
        .replace('{{GALLERY}}', gallery).replace('{{COUNT}}', str(len(GALLERY)))
        .replace('{{FOOTER}}', FOOTER).replace('{{LIGHTBOX}}', LIGHTBOX),
    'history.html': (HERE / 'history.tpl.html').read_text()
        .replace('{{ARCHIVE}}', '    ' + archive).replace('{{FOOTER}}', FOOTER),
}
assets = set()
for name, text in pages.items():
    assert '{{' not in text, name
    (HERE / name).write_text(text)
    assets |= set(re.findall(r"""(?:src|data-full)="([^"]+\.(?:webp|jpg|JPG|png))"|url\('([^']+)'\)""", text) and
                  [a or b for a, b in re.findall(r"""(?:src|data-full)="([^"]+\.(?:webp|jpg|JPG|png))"|url\('([^']+)'\)""", text)])
for a in sorted(assets):
    shutil.copy2(SRC / a, HERE / a)
print(f'{len(assets)} images copied')
