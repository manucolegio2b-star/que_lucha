# -*- coding: utf-8 -*-
"""
Impresor local: recibe el calendario desde el panel de pedidos y lo imprime
con tu Photoshop en tu impresora. No crea carpetas: el archivo es temporal y se borra.

Lo arranca solo el botón "Imprimir en la SRA3" del panel (después de ejecutar
instalar_enlace.py una vez). También puedes abrirlo a mano con doble clic.
Necesita Python 3.8 y pywin32 (los mismos que tus otros programas de impresión).
"""
import json
import os
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# --- Configuración (igual que en imprimir_todas.py) ---
IMPRESORA = "SRA3 CARTULINA 3 B5"   # nombre EXACTO de la impresora en Windows
COPIAS = 1
PUERTO = 47651
ORIGENES = ["https://que-lucha.manucolegio2b.workers.dev"]   # solo este panel puede mandar órdenes
MAX_BYTES = 60 * 1024 * 1024

PS_NO_GUARDAR = 2
PS_SIN_DIALOGOS = 3
ERRORES_OCUPADO = (-2147418111, -2147417846)

PRUEBA = "--prueba" in sys.argv          # no toca Photoshop (solo para comprobar la conexión)
for i, a in enumerate(sys.argv):
    if a == "--origen" and i + 1 < len(sys.argv):
        ORIGENES.append(sys.argv[i + 1])

ocupado = threading.Lock()


def reintentar(funcion, intentos=90, espera=1.0):
    import pywintypes
    for intento in range(intentos):
        try:
            return funcion()
        except pywintypes.com_error as e:
            if e.args[0] in ERRORES_OCUPADO and intento < intentos - 1:
                time.sleep(espera)
            else:
                raise


def impresora_ok():
    if PRUEBA:
        return True, IMPRESORA
    import win32print
    p = win32print.GetDefaultPrinter()
    return p == IMPRESORA, p


def imprimir_jpg(ruta):
    import pythoncom
    import win32com.client
    pythoncom.CoInitialize()
    try:
        app = win32com.client.Dispatch("Photoshop.Application.80")
        reintentar(lambda: app.Documents.Count)
        antes = reintentar(lambda: app.DisplayDialogs)
        reintentar(lambda: setattr(app, "DisplayDialogs", PS_SIN_DIALOGOS))
        doc = None
        try:
            doc = reintentar(lambda: app.Open(ruta))
            reintentar(lambda: setattr(app, "ActiveDocument", doc))
            for _ in range(COPIAS):
                reintentar(lambda: app.DoJavaScript("app.activeDocument.printOneCopy();"))
            time.sleep(5)
        finally:
            if doc is not None:
                try:
                    reintentar(lambda: doc.Close(PS_NO_GUARDAR))
                except Exception:
                    pass
            try:
                reintentar(lambda: setattr(app, "DisplayDialogs", antes))
            except Exception:
                pass
    finally:
        pythoncom.CoUninitialize()


class Manejador(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _cors(self):
        o = self.headers.get("Origin", "")
        if o in ORIGENES:
            self.send_header("Access-Control-Allow-Origin", o)
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Vary", "Origin")
            return True
        return False

    def _json(self, codigo, datos):
        cuerpo = json.dumps(datos).encode("utf-8")
        self.send_response(codigo)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def _permitido(self):
        if self.headers.get("Origin", "") in ORIGENES:
            return True
        self._json(403, {"ok": False, "error": "Origen no permitido."})
        return False

    def do_OPTIONS(self):
        if not self._permitido():
            return
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if not self._permitido():
            return
        if self.path.split("?")[0] != "/estado":
            return self._json(404, {"ok": False, "error": "No existe."})
        bien, actual = impresora_ok()
        self._json(200, {"ok": True, "impresora": IMPRESORA, "predeterminada": actual,
                         "predeterminada_ok": bien, "prueba": PRUEBA})

    def do_POST(self):
        if not self._permitido():
            return
        if self.path.split("?")[0] != "/imprimir":
            return self._json(404, {"ok": False, "error": "No existe."})
        try:
            n = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            n = 0
        if n <= 0 or n > MAX_BYTES:
            return self._json(400, {"ok": False, "error": "Archivo vacío o demasiado grande."})
        datos = self.rfile.read(n)
        if datos[:3] != b"\xff\xd8\xff":
            return self._json(400, {"ok": False, "error": "El archivo no es un JPG."})
        bien, actual = impresora_ok()
        if not bien:
            return self._json(409, {"ok": False, "error": "La impresora predeterminada de Windows es '" + actual +
                                    "' y debe ser '" + IMPRESORA + "'. No se ha imprimido nada."})
        if not ocupado.acquire(blocking=False):
            return self._json(429, {"ok": False, "error": "Ya hay una impresión en curso. Espera a que termine."})
        ruta = None
        try:
            fd, ruta = tempfile.mkstemp(suffix=".jpg", prefix="calendario_")
            with os.fdopen(fd, "wb") as f:
                f.write(datos)
            if not PRUEBA:
                imprimir_jpg(ruta)
            print("Enviado a imprimir:", self.path)
            self._json(200, {"ok": True, "prueba": PRUEBA})
        except Exception as e:
            print("ERROR:", e)
            self._json(500, {"ok": False, "error": "No se pudo imprimir: " + str(e)[:200]})
        finally:
            ocupado.release()
            if ruta:
                try:
                    os.remove(ruta)
                except Exception:
                    pass


def main():
    try:
        servidor = ThreadingHTTPServer(("127.0.0.1", PUERTO), Manejador)
    except OSError:
        print("El impresor ya está abierto. No hace falta abrirlo otra vez.")
        time.sleep(2)
        return
    print("Impresor local listo (impresora: %s)%s." % (IMPRESORA, " [MODO PRUEBA]" if PRUEBA else ""))
    print("Déjalo abierto mientras uses el botón 'Imprimir en la SRA3' del panel. Puedes minimizar esta ventana.")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
