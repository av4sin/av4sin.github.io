---
layout: post
title: "Por fin: driver para el MT7902 (WiFi + Bluetooth) en mi portátil"
date: 2026-04-10
categories: [tecnico, linux, hardware]
tags: [fedora, mt7902, wifi, bluetooth, drivers, kernel, mediatek]
---

## Dos años con un portátil capado a medias

Hoy por fin puedo escribir esto: **ya hay driver funcional para el MT7902** y he conseguido conectar en Linux tanto el WiFi como el Bluetooth integrados del portátil.

Y sí, suena simple, pero para mí no lo ha sido nada.

Hace 2 años me compré este portátil y desde el primer día he tenido que depender de una tarjeta WiFi USB externa, de esas pequeñitas estilo receptor de ratón inalámbrico, porque no quedaba otra opción. Funcionaba, pero era una lotería constante: compatibilidades raras, interfaces que aparecían y desaparecían, y más de un quebradero de cabeza cuando menos me convenía. Ya no hablemos de la velocidad tortuga que tenía.

Así que hoy toca celebrar una pequeña gran victoria.

## Crédito donde toca

Este trabajo no lo hice yo: el mérito del driver/backport y la documentación de instalación es de **[hmtheboy154](https://github.com/hmtheboy154)** y su repositorio:

- `https://github.com/hmtheboy154/mt7902`

Sin ese trabajo, seguiríamos en el limbo con este chip.

## Instalación del WiFi (MT7902)

Este fue el proceso en mi Fedora 43 (kernel `6.19.11-200.fc43.x86_64`):

```bash
git clone https://github.com/hmtheboy154/mt7902
cd mt7902
sudo make install -j$(nproc)
sudo make install_fw
sudo depmod -a
sudo modprobe mt7902e
```

Compiló e instaló bien el módulo `mt7902e.ko`, y al revisar logs ya salía la tarjeta:

```bash
sudo dmesg | grep mt7902
```

En mi caso esta era la salida:

```text
[ 8066.890199] mt7902e 0000:01:00.0: enabling device (0000 -> 0002)
[ 8066.910629] mt7902e 0000:01:00.0: ASIC revision: 79020000
[ 8067.020302] mt7902e 0000:01:00.0: HW/SW Version: 0x8a108a10, Build Time: 20251212032046a
[ 8067.221380] mt7902e 0000:01:00.0: WM Firmware Version: ____000000, Build Time: 20251212032127
[ 8068.176097] mt7902e 0000:01:00.0 wlp1s0: renamed from wlan0
```

Y en `ip a` ya aparecía `wlp1s0` operativa con IP, es decir: **WiFi interno funcionando**. Algo que estuve investigando meses y meses, porfín cumplido.

## Instalación del Bluetooth (backport)

Para Bluetooth usé la rama específica `bluetooth_backport`:

```bash
cd ..
git clone https://github.com/hmtheboy154/mt7902 -b bluetooth_backport btusb_mt7902
cd btusb_mt7902
sudo make install -j$(nproc)
sudo make install_fw
```

Aquí vino la parte divertida (véase: dolor): al principio me comí un clásico `Exec format error` al cargar el módulo:

```bash
sudo modprobe btusb_mt7902
modprobe: ERROR: could not insert 'btusb_mt7902': Exec format error
```

También metí la pata intentando hacer `blacklist` directamente en consola (spoiler: no existe como comando. Habría estado bien leer la documentación en vez de ir a lo loco). Lo correcto fue añadirlo al archivo en `/etc/modprobe.d/blacklist_btusb.conf` y recompilar limpio.

De nuevo repetimos procedimiento. Esta vez tenemos que hacer un make clean para eliminar posibles errores de la compilación anterior y también hacer un modprobe -r ya que no quería reiniciar el portátil.

```bash
sudo modprobe -r btusb
sudo modprobe -r btmtk
make clean
make -j$(nproc)
sudo make install
sudo modprobe btusb_mt7902
```

Después de reinstalar el módulo ya no salió ningún error al cargarlo.

## Qué me llevo de esto

- Por fin puedo usar el portátil **sin depender del adaptador USB externo**.
- El WiFi integrado MT7902 queda operativo con `mt7902e`.
- El Bluetooth requiere el backport, pero también puede quedar funcional.
- Si te sale `Exec format error`, no cunda el pánico: descarga, recompila limpio, reinstala y vuelve a cargar módulo.

Después de dos años peleando compatibilidades absurdas por un chip integrado, este post me sabe a victoria.

¡Nos vemos en el siguiente log!
