from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/cesta-nacional-icon.png')
outputs = [
    Path('/home/ubuntu/cesta-nacional-mobile/assets/images/icon.png'),
    Path('/home/ubuntu/cesta-nacional-mobile/assets/images/splash-icon.png'),
    Path('/home/ubuntu/cesta-nacional-mobile/assets/images/favicon.png'),
    Path('/home/ubuntu/cesta-nacional-mobile/assets/images/android-icon-foreground.png'),
]

image = Image.open(source).convert('RGBA')
image.thumbnail((512, 512), Image.Resampling.LANCZOS)
for output in outputs:
    image.save(output, format='PNG', optimize=True, compress_level=9)
