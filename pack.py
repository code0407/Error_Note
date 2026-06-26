import sys, re, os
sys.stdout.reconfigure(encoding='utf-8')
BASE = r"E:\界面"
with open(os.path.join(BASE, 'index.html'), 'r', encoding='utf-8') as f: html = f.read()
with open(os.path.join(BASE, 'src', 'core.js'), 'r', encoding='utf-8') as f: core = f.read()
with open(os.path.join(BASE, 'src', 'router.js'), 'r', encoding='utf-8') as f: router = f.read()
html2 = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL)
CDN = '<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>'
if CDN not in html2:
    head_end = html2.rfind('</head>')
    html2 = html2[:head_end] + '\n' + CDN + '\n' + html2[head_end:]
scripts_html = '\n<script>\n' + core.strip() + '\n</script>\n<script>\n' + router.strip() + '\n</script>\n'
body_end = html2.rfind('</body>')
if body_end < 0:
    final = html2.strip() + '\n' + scripts_html + '\n</body></html>'
else:
    final = html2[:body_end].rstrip() + '\n' + scripts_html + '\n' + html2[body_end:]
with open(os.path.join(BASE, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(final)
scripts = re.findall(r"<script[^>]*>(.*?)</script>", final, re.DOTALL)
print(f"size={len(final)} scripts={len(scripts)}")
for i,s in enumerate(scripts):
    bo=s.count('{'); bc=s.count('}'); po=s.count('('); pc=s.count(')')
    print(f"  script{i}: braces {bo}/{bc} parens {po}/{pc} len={len(s)} head?={s[:40].replace(chr(10),' ')}")
print(f"recognizeImage={'recognizeImage' in final} exportPaperTxt={'exportPaperTxt' in final} inpAddImg={'inpAddImg' in final}")
print(f"capture_env={'capture=' in final}")
