---
layout: post
title: "Un script en Bash para automatizar la instalacion y recompilacion de los drivers del MT7902"
date: 2026-04-26
categories: [tecnico, linux, hardware]
tags: [fedora, mt7902, wifi, bluetooth, drivers, bash, automatizacion, kernel, mediatek]
---

## Cuando repetir comandos deja de tener gracia

Despues de pelearme durante meses con el MT7902, logré [encontrar unos drivers funcionales](/blog/2026/04/10/por-fin-driver-mt7902-wifi-bluetooth/), pero tenían un problema `out-of-tree driver` tal y como aparece en el repo. En castellano eso significa que cada pequeña nueva modificación en el kernel te va a tocar recompilar y por eso el siguiente paso estaba cantado: **dejar de hacer a mano siempre lo mismo**.

Porque una cosa es entender el proceso de instalacion de un driver. Otra muy distinta es tener que repetirlo cada vez que quieres recompilar, reinstalar, actualizar el modulo o simplemente recuperar una configuracion que se ha quedado a medias. En ese punto ya no estas administrando tu sistema: estas recitando un ritual.

Y yo ya estaba cansado de escribir el mismo bloque de comandos una y otra vez.

Este post va de eso: de convertir todo el proceso de instalacion de los drivers de **WiFi** y **Bluetooth** del MT7902 en un **script en Bash** sencillo, legible y pensado para ejecutarse desde la carpeta que contiene los dos repositorios.

---

## El punto de partida

Si has seguido el post anterior, ya sabes que el chip me obliga a trabajar con dos repos distintos:

- uno para el driver de **WiFi**, en `mt7902`
- otro para el backport de **Bluetooth**, en `btusb_mt7902`

La parte importante es que ambos repos quedan en una carpeta padre comun. Es decir, el script no se ejecuta dentro de uno de los repos, sino **desde fuera**, justo en el directorio que contiene a los dos.

La estructura que tengo yo es algo asi:

```text
.wifiDrivers/
├── mt7902/
└── btusb_mt7902/
```

Eso me permite lanzar un unico script y olvidarme de ir entrando a cada repo a mano.

---

## Lo que queria conseguir

La idea no era hacer un monstruo de automatizacion. No hacia falta.

Queria algo muy concreto:

- entrar en el repo del WiFi
- compilar e instalar el modulo
- instalar los ficheros de firmware
- regenerar dependencias del kernel
- cargar el modulo correcto
- repetir exactamente el mismo flujo para Bluetooth

En otras palabras: coger los comandos que ya funcionaban y empaquetarlos en una secuencia que pudiera ejecutar sin pensar demasiado.

Y esto, aunque parezca una tonteria, ahorra bastante tiempo cuando ya has pasado por el proceso varias veces.

---

## El script

Este es el Bash que me quedo finalmente. Esta pensado para ejecutarse desde la carpeta padre donde viven los dos repositorios:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIFI_DIR="$ROOT_DIR/mt7902"
BT_DIR="$ROOT_DIR/btusb_mt7902"

if [[ ! -d "$WIFI_DIR" ]]; then
  echo "No encuentro el repo de WiFi en: $WIFI_DIR"
  exit 1
fi

if [[ ! -d "$BT_DIR" ]]; then
  echo "No encuentro el repo de Bluetooth en: $BT_DIR"
  exit 1
fi

echo "==> Instalando y recompilando WiFi"
cd "$WIFI_DIR"
sudo make install -j"$(nproc)"
sudo make install_fw
sudo depmod -a
sudo modprobe mt7902e

echo "==> Instalando y recompilando Bluetooth"
cd "$BT_DIR"
sudo make install -j"$(nproc)"
sudo make install_fw
sudo depmod -a
sudo modprobe btusb_mt7902

echo "Proceso terminado"
```

---

## Por que esta escrito asi

Lo primero que hice fue usar `set -euo pipefail`. Esto merece una explicacion corta porque es de esas cosas que parecen ornamento, pero no lo son.

- `-e` hace que el script pare en cuanto algo falla
- `-u` evita usar variables sin definir
- `pipefail` hace que una tuberia falle si falla cualquiera de sus partes

En un script que toca compilacion e instalacion de kernel modules, eso no es lujo: es sentido comun. Prefiero que el proceso se detenga en el primer error antes que seguir adelante como si nada y dejarme el sistema en un estado raro.

Despues uso `ROOT_DIR` para averiguar desde donde se lanzo el script. Eso me evita depender del directorio actual del terminal, que es una fuente clasica de errores humanos.

La idea es simple: si el script esta en la carpeta padre, entonces puede localizar de forma relativa a `mt7902` y `btusb_mt7902` sin que yo tenga que escribir rutas absolutas ni moverme manualmente entre directorios.

---

## El flujo del WiFi

La parte del WiFi es la primera que ejecuto porque fue la que originalmente me permitio recuperar la tarjeta integrada.

La secuencia es esta:

```bash
cd mt7902
sudo make install -j$(nproc)
sudo make install_fw
sudo depmod -a
sudo modprobe mt7902e
```

Aqui no hay demasiada magia, pero si hay orden.

Primero se compila e instala el modulo. Despues se instalan los ficheros de firmware. Luego se actualizan las dependencias del kernel con `depmod -a`. Y al final se carga el modulo con `modprobe mt7902e`.

Ese orden importa. Si intentas cargar el modulo antes de regenerar dependencias, puedes encontrarte con que el sistema todavia no ha recogido lo nuevo. Y si no instalas el firmware antes, el modulo puede cargar pero quedarse a medias cuando intenta inicializar el chip.

---

## El flujo del Bluetooth

Para Bluetooth la logica es practicamente la misma, pero usando el repositorio del backport:

```bash
cd btusb_mt7902
sudo make install -j$(nproc)
sudo make install_fw
sudo depmod -a
sudo modprobe btusb_mt7902
```

Aqui la clave es que no estoy instalando "Bluetooth en general", sino una variante concreta preparada para este hardware y para el estado del soporte que tenia cuando hice la prueba.

Por eso el repo es distinto, el modulo es distinto y el resultado tambien lo es.

Lo interesante de automatizar esto es que ya no tengo que recordar si el comando iba con `btusb_mt7902`, con `btusb`, con `btmtk` o con otra variante parecida. El script deja eso fijo en un sitio y me quita de encima la parte mecánica.

---

## La ventaja real del script

La ventaja no es que escriba menos.

La ventaja es que **reduzco errores tontos**.

Cuando haces todo a mano, el problema no suele ser el comando grande. El problema suele ser el pequeño desliz:

- entrar en el repo equivocado
- olvidarte de volver a ejecutar `depmod`
- cargar el modulo correcto a medias
- pensar que ya has reinstalado algo cuando en realidad solo lo has recompilado
- repetir el procedimiento en el orden incorrecto

El script elimina esa capa de improvisacion. Te deja una secuencia fija, repetible y menos propensa a fallos humanos.

Y eso, en el mundo real, vale mucho mas que la estetica de escribir cuatro comandos bonitos en el terminal.

---

## Un atajo para lanzarlo desde cualquier sitio

Despues de tener el automatismo funcionando, yo queria dar un paso mas: poder escribir un unico comando en la terminal, desde donde fuera, y que eso lanzara todo el proceso sin tener que moverme manualmente a la carpeta del script.

La forma mas comoda de hacerlo es definir una funcion en el archivo de arranque de tu shell. En mi caso, el atajo se llama `updatewifidrivers` y apunta directamente a `/home/av4sin/.wifiDrivers/automate.sh`.

Si usas Zsh, puedes añadir esto al final de `~/.zshrc`:

```bash
updatewifidrivers() {
  bash /home/av4sin/.wifiDrivers/automate.sh
}
```

Si prefieres dejarlo como comando ejecutable, tambien puedes dar permisos al script y llamarlo sin `bash`:

```bash
chmod +x /home/av4sin/.wifiDrivers/automate.sh
```

Y entonces la funcion podria quedar asi:

```bash
updatewifidrivers() {
  /home/av4sin/.wifiDrivers/automate.sh
}
```

La idea es sencilla: recargas la shell, escribes `updatewifidrivers` en cualquier terminal y el sistema ejecuta el automatismo completo sin pedirte que recuerdes rutas ni nombres de repositorios.

---

## Si algo falla

La parte honesta: esto no convierte el proceso en infalible.

Si el kernel cambia, si el repo tiene un cambio de compilacion, si el firmware no esta donde toca o si el modulo anterior se queda enganchado, el script va a parar antes o despues. Eso es bueno. Prefiero un fallo visible a una instalacion "aparentemente correcta" que luego deja el WiFi o el Bluetooth a medias.

En mi caso, el objetivo era sobre todo tener una forma rapida de repetir el proceso cuando hiciera falta, no esconder los errores bajo una capa de magia negra.

---

## Lo que me llevo de esto

- Ya no tengo que repetir a mano toda la secuencia de instalacion.
- El script funciona desde la carpeta padre de los dos repositorios.
- WiFi y Bluetooth quedan agrupados en un unico flujo de trabajo.
- Si vuelvo a recompilar los drivers, tendre menos posibilidades de equivocarme por puro cansancio.

Al final, este tipo de automatizaciones no son glamourosas. No presumen. No impresionan a nadie en una captura de pantalla.

Pero resuelven problemas de verdad.

Y cuando llevas demasiado tiempo peleandote con un chip integrado, cualquier cosa que te devuelva tiempo y paz mental merece la pena.

Si este MT7902 me ha enseñado algo, es que a veces el progreso no consiste en encontrar el driver perfecto. A veces consiste simplemente en **dejar de hacer manualmente una tarea que ya sabes que vas a repetir**.

Y con eso, por fin, me basta.

¡Nos vemos en el próximo log!
