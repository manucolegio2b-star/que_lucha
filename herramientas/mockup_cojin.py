# Genera una foto de cojín (1000 x 1000) con relieve, arrugas y sombra.
# La misma geometría se usa en textos.js para curvar y sombrear el diseño, así encaja con la foto.
import numpy as np, cv2

N = 1000; SS = 2; M = N * SS
C = 500.0; S = 452.0          # centro y semilado del cojín (px)
A = 0.06                      # pellizco de los lados (se curvan hacia dentro)
ALB = 236.0                    # blanco de la tela

ys, xs = np.mgrid[0:M, 0:M].astype(np.float32) / SS
X = (xs - C) / S; Y = (ys - C) / S
u, v = X.copy(), Y.copy()
for _ in range(6):             # invertir x = u(1-A(1-v²)), y = v(1-A(1-u²))
    u = X / (1 - A * (1 - v * v)); v = Y / (1 - A * (1 - u * u))
inside = (np.abs(u) <= 1) & (np.abs(v) <= 1)
uc, vc = np.clip(u, -1, 1), np.clip(v, -1, 1)

# Relieve: abombado + arrugas suaves en las esquinas + borde de costura
H = 175.0
h = H * np.power(np.clip(1 - uc ** 2, 0, 1), 1.0) * np.power(np.clip(1 - vc ** 2, 0, 1), 1.0)
for cu, cv in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    du, dv = (uc - cu) * -cu, (vc - cv) * -cv          # 0 en la esquina, hacia dentro positivo
    d = np.sqrt(du * du + dv * dv); th = np.arctan2(dv, du)
    h += 3.5 * np.exp(-d / 0.25) * np.cos(th * 9 + cu * 0.7 + cv * 1.3) * np.clip(d / 0.08, 0, 1)
rng = np.random.default_rng(5)
lowf = cv2.GaussianBlur(rng.normal(0, 1, (M, M)).astype(np.float32), (0, 0), 70 * SS)
h += lowf / lowf.std() * 3.5
gy, gx = np.gradient(h * SS)
gx = 6 * np.tanh(gx / 6); gy = 6 * np.tanh(gy / 6)
n = np.dstack([-gx, -gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
dif = np.clip((n * L).sum(2), 0, 1)
hv = np.array([0, 0, 1]) + L; hv /= np.linalg.norm(hv)
spec = np.clip((n * hv).sum(2), 0, 1) ** 40
flat = (np.array([0, 0, 1]) * L).sum()
shade = 0.42 + 0.58 * dif / flat
shade = shade * 0.95 + spec * 0.05
shade = np.where(shade > 1, 1 + (shade - 1) * 0.35, shade)
# oclusión suave junto al borde
edge = np.minimum(1 - np.abs(uc), 1 - np.abs(vc))
shade *= 1 - 0.08 * np.exp(-edge / 0.06)
# trama fina de la tela
tex = rng.normal(0, 1, (M, M)).astype(np.float32)
tex = cv2.GaussianBlur(tex, (0, 0), 0.6 * SS)
shade *= 1 + tex / tex.std() * 0.008

# Fondo y sombra
bg_top = np.array([170, 250, 232], np.float32); bg_bot = np.array([132, 214, 196], np.float32)  # RGB
t = (ys / N)[..., None]
bg = bg_top * (1 - t) + bg_bot * t
vig = 1 - 0.10 * (((xs - C) / N) ** 2 + ((ys - C) / N) ** 2)[..., None] * 2
bg *= vig
msk = cv2.morphologyEx(inside.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (34 * SS, 34 * SS))).astype(np.float32)
msk = cv2.GaussianBlur(msk, (0, 0), 0.7 * SS)
sh = cv2.GaussianBlur(np.roll(np.roll(msk, int(16 * SS), 0), int(12 * SS), 1), (0, 0), 22 * SS)
bg *= (1 - 0.42 * sh)[..., None]
pill = (ALB * shade)[..., None] * np.array([1.0, 1.0, 1.005], np.float32)
img = bg * (1 - msk[..., None]) + pill * msk[..., None]
img = cv2.resize(np.clip(img, 0, 255).astype(np.uint8), (N, N), interpolation=cv2.INTER_AREA)
cv2.imwrite('mockup2.jpg', cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
print('ok', float(shade[inside].min()), float(shade[inside].max()))
