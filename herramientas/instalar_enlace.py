# -*- coding: utf-8 -*-
"""
Ejecutar UNA sola vez (doble clic). Registra en Windows el enlace "qlimprimir:" para que
el botón "Imprimir en la SRA3" del panel pueda abrir impresor_local.py solo.
No necesita ser administrador ni crea carpetas.
"""
import os
import sys
import winreg

aqui = os.path.dirname(os.path.abspath(__file__))
script = os.path.join(aqui, "impresor_local.py")
if not os.path.exists(script):
    print("No encuentro impresor_local.py junto a este archivo.")
    input("Pulsa Intro para salir.")
    raise SystemExit

comando = '"%s" "%s"' % (sys.executable, script)
raiz = r"Software\Classes\qlimprimir"
with winreg.CreateKey(winreg.HKEY_CURRENT_USER, raiz) as k:
    winreg.SetValue(k, "", winreg.REG_SZ, "URL:Impresor Que Lucha")
    winreg.SetValueEx(k, "URL Protocol", 0, winreg.REG_SZ, "")
with winreg.CreateKey(winreg.HKEY_CURRENT_USER, raiz + r"\shell\open\command") as k:
    winreg.SetValue(k, "", winreg.REG_SZ, comando)

print("Listo. El panel ya puede abrir el impresor por su cuenta.")
print("Si mueves esta carpeta de sitio, vuelve a ejecutar este archivo.")
input("Pulsa Intro para salir.")
