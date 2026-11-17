import numpy as np, cv2, json
a = cv2.imread('pillow-mockup.jpg').astype(np.float32)   # BGR 2500 x 2000
PINK = np.array([204, 180, 252], np.float32)                     # BGR del fondo
MINT = np.array([228, 244, 166], np.float32)                     # BGR: verde menta de la web
X0, Y0, SIDE, OUT = 687, 448, 1150, 1000

# cuánto "rosa" tiene cada píxel respecto a su brillo (el cojín es gris neutro)
Y = a @ np.array([0.114, 0.587, 0.299], np.float32)
Yp = float(PINK @ np.array([0.114, 0.587, 0.299], np.float32))
chroma = a[..., 2] - a[..., 1]                       # R - G
ratio = chroma / np.maximum(Y, 1)
rp = (PINK[2] - PINK[1]) / Yp
al = np.clip((ratio / rp - 0.15) / 0.7, 0, 1)        # 1 = fondo / sombra, 0 = cojín
f = Y / Yp                                           # sombra (1 = fondo sin sombra)
# la sombra se desvanece antes del borde del recorte para que no quede cortada
yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]].astype(np.float32)
d = np.minimum.reduce([xx - X0, X0 + SIDE - xx, yy - Y0, Y0 + SIDE - yy])
fade = np.clip(d / 120, 0, 1)
f = 1 - (1 - f) * fade
bg = MINT * np.clip(f, 0, 1.05)[..., None]
out = a * (1 - al[..., None]) + bg * al[..., None]
crop = np.clip(out[Y0:Y0 + SIDE, X0:X0 + SIDE], 0, 255).astype(np.uint8)
crop = cv2.resize(crop, (OUT, OUT), interpolation=cv2.INTER_AREA)
cv2.imwrite('mockup4.jpg', crop, [cv2.IMWRITE_JPEG_QUALITY, 90])

# Geometría para textos.js (en px de la foto final)
k = OUT / SIDE
C = {'TL': (804, 533), 'TR': (1741, 551), 'BR': (1696, 1520), 'BL': (783, 1484)}
cx = np.mean([p[0] for p in C.values()]); cy = np.mean([p[1] for p in C.values()])
KX, KY = 0.678, 0.662
q = []
for n in ['TL', 'TR', 'BR', 'BL']:
    x, y = C[n]
    q.append([round((cx + (x - cx) * KX - X0) * k, 1), round((cy + (y - cy) * KY - Y0) * k, 1)])
print(json.dumps(q))
