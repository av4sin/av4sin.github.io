---
layout: post
title: "Lynis: La auditoría de seguridad que casi me deja sin Fedora (o cómo endurecer el sistema sin romperlo)"
date: 2026-02-01
categories: [tecnico, linux, seguridad]
tags: [fedora, lynis, hardening, sysctl, auditd, seguridad]
---

## El despertar paranoico (o por qué decidí auditar mi Fedora)

Mañana gris en la trinchera digital. Ahí estoy yo, sorbiendo café virtual, pensando: "¿Y si mi Fedora está más expuesta que un turista en la playa?". Porque, admitámoslo, Linux es genial, pero a veces sientes que tu sistema es como una casa con la puerta abierta y un cartel de "Bienvenidos hackers". Decidí armarme con Lynis, esa herramienta que te dice si tu setup es una fortaleza o un coladero. ¿Qué podía salir mal? Spoiler: casi todo.

## ¿Qué es Lynis? Mi encuentro con el auditor paranoico

Antes de lanzarme a la batalla, déjame contarte cómo me topé con Lynis, ese auditor de seguridad que me hizo sentir como un paciente en una consulta médica forzada. Es una herramienta gratuita y de código abierto que viene de CISOfy, una grupo holandés que desde 2007 se dedica a revolver los cajones de los sysadmins como yo. No es un antivirus que te protege en tiempo real, ni un firewall que bloquea ataques; es más bien ese amigo entrometido que te dice "oye, tu casa está llena de agujeros" después de inspeccionar todo.

¿Qué hace exactamente? Lynis analiza todo: desde el kernel y los servicios de systemd hasta permisos de archivos, políticas de contraseñas y configuraciones de red. Te dice si tus servicios están "expuestos" o "protegidos", si hay malware potencial, y te da sugerencias específicas para mejorar. Es como un doctor forense que no cobra por hora, dándote un "Hardening Index" del 0 al 100, donde 100 es prácticamente inexpugnable.

Lo mejor de todo: no hace falta instalarlo con dnf o apt, que en Fedora a veces dejan residuos raros. Lo bajas directamente de su sitio (https://cisofy.com/lynis/) como un tarball, lo descomprimes con `tar -xzf lynis-3.1.6.tar.gz`, entras en la carpeta y lanzas `./lynis audit system`. ¡Boom! Funciona en cualquier distro sin dejar huella, perfecto para paranoicos como yo que no quieren software extra en el sistema. Ideal para auditorías rápidas o en sistemas donde no quieres instalar software adicional.

Ahora, con esta herramienta en mano, empecé mi aventura...

## El diagnóstico inicial: Lynis me abre los ojos

Primero, lo básico. Lancé `./lynis audit system` y Lynis escaneó mi Fedora 43, dándome un Hardening Index de 70. No mal, pero con potencial para ser una bestia. Los puntos débiles: systemd-analyze security mostraba servicios como NetworkManager y avahi-daemon en "EXPUESTO" o "INSEGURO". El kernel tenía valores por defecto que eran como dejar la llave en la cerradura. Y no había auditoría de archivos ni escáneres de malware. Era hora de actuar.

Empecé con los comandos que Lynis sugería.

### 1. Parámetros del Kernel (Endurecimiento básico)

El kernel de Linux es el corazón del sistema, y por defecto viene con configuraciones relajadas para facilitar la compatibilidad. Pero eso puede ser un riesgo: ataques como inyecciones de memoria o espionaje de red pasan por ahí. Estos comandos ajustan parámetros del kernel (sysctl) para endurecerlo. Vamos a desglosar cada uno para que sepas exactamente qué estás ejecutando:

- `sudo tee /etc/sysctl.d/99-lynis-hardening.conf <<EOF`: Crea o sobrescribe un archivo de configuración en `/etc/sysctl.d/` llamado `99-lynis-hardening.conf`. `tee` escribe la entrada estándar al archivo, y `sudo` lo hace con permisos de root. El `<<EOF` inicia un "here document" para escribir múltiples líneas.

- Dentro del EOF:
  - `fs.protected_fifos = 2`: Protege contra ataques de enlace simbólico en FIFOs (pipes con nombre), previniendo que un usuario no privilegiado manipule pipes de otros.
  - `fs.protected_regular = 2`: Similar, pero para archivos regulares, bloquea enlaces simbólicos que apunten a archivos de otros usuarios.
  - `fs.suid_dumpable = 0`: Deshabilita volcados de memoria (core dumps) para procesos con SUID, evitando que se filtre información sensible en crashes.

  - `kernel.dmesg_restrict = 1`: Restringe el acceso al buffer de mensajes del kernel (`dmesg`) a usuarios no root, previniendo fugas de información del sistema.
  - `kernel.kptr_restrict = 2`: Oculta direcciones de memoria del kernel en `/proc/kallsyms`, dificultando exploits que busquen punteros.
  - `kernel.unprivileged_bpf_disabled = 1`: Deshabilita eBPF (Berkeley Packet Filter) para usuarios sin privilegios, reduciendo riesgos de exploits en el subsistema de red.
  - `kernel.yama.ptrace_scope = 1`: Restringe `ptrace` (usado para debugging) a procesos del mismo usuario, previniendo ataques de inyección de código.
  - `kernel.sysrq = 0`: Deshabilita SysRQ (teclas mágicas del kernel), evitando reinicios o dumps no autorizados.

  - `net.ipv4.conf.all.log_martians = 1`: Registra paquetes con direcciones fuente imposibles (martians), ayudando a detectar ataques de spoofing.
  - `net.ipv4.conf.default.log_martians = 1`: Lo mismo, pero para interfaces por defecto.
  - `net.ipv4.conf.all.rp_filter = 1`: Activa el filtro de ruta reversa (RP filter), descartando paquetes spoofed que no coincidan con rutas esperadas.
  - `net.ipv4.conf.all.accept_redirects = 0`: Ignora redirecciones ICMP, previniendo ataques Man-in-the-Middle.
  - `net.ipv6.conf.all.accept_redirects = 0`: Lo mismo para IPv6.

- `EOF`: Cierra el here document.
- `# Aplicar los cambios`: Comentario.
- `sudo sysctl -p /etc/sysctl.d/99-lynis-hardening.conf`: Carga los parámetros desde el archivo. `sysctl -p` aplica configuraciones de archivos en `/etc/sysctl.d/`.

Recuerda: estos cambios se aplican inmediatamente, pero si algo sale mal, puedes revertir borrando el archivo y reiniciando. No toques `kernel.modules_disabled` aquí, como verás más adelante.

```bash
sudo tee /etc/sysctl.d/99-lynis-hardening.conf <<EOF
# Protección contra enlaces (links) y volcados de memoria
fs.protected_fifos = 2
fs.protected_regular = 2
fs.suid_dumpable = 0

# Restricciones del Kernel
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.unprivileged_bpf_disabled = 1
kernel.yama.ptrace_scope = 1
kernel.sysrq = 0

# Endurecimiento de Red
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
EOF

# Aplicar los cambios
sudo sysctl -p /etc/sysctl.d/99-lynis-hardening.conf
```

### 2. Políticas de Usuarios y Contraseñas

Las contraseñas débiles son la puerta trasera más común. Lynis señaló que las políticas por defecto de Fedora eran "débiles", así que ajusté el archivo `/etc/login.defs`, que controla cómo se manejan las cuentas. Vamos a desglosar cada comando:

- `sudo sed -i 's/^UMASK.*/UMASK           027/' /etc/login.defs`: Usa `sed` para editar in-place (`-i`) el archivo `/etc/login.defs`. Sustituye cualquier línea que empiece con `UMASK` por `UMASK           027`. `027` significa que nuevos archivos tienen permisos 750 (owner: rwx, group: rx, others: none), previniendo lecturas no autorizadas. `sudo` ejecuta como root.

- `sudo sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs`: Cambia el máximo de días para una contraseña a 90, forzando rotación periódica.
- `sudo sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   1/' /etc/login.defs`: Establece mínimo 1 día antes de poder cambiar contraseña, previniendo bypasses.

- `if ! grep -q "SHA_CRYPT_MIN_ROUNDS" /etc/login.defs; then`: Verifica si la línea `SHA_CRYPT_MIN_ROUNDS` no existe (`!` niega, `grep -q` es silencioso). Si no está, ejecuta el bloque.
- `echo "SHA_CRYPT_MIN_ROUNDS 5000" | sudo tee -a /etc/login.defs`: Añade la línea al final del archivo (`-a` append), configurando mínimo 5000 rondas de hashing SHA512 para contraseñas, haciendo crackeo más lento.
- `echo "SHA_CRYPT_MAX_ROUNDS 10000" | sudo tee -a /etc/login.defs`: Similar, máximo 10000 rondas.
- `fi`: Cierra el if.

Estos cambios afectan a nuevas cuentas; para existentes, usa `chage`. Si configuras mal, podrías bloquearte, así que ten una sesión root abierta.

```bash
# Corregir la máscara de usuario por defecto (Umask)
sudo sed -i 's/^UMASK.*/UMASK           027/' /etc/login.defs

# Configurar envejecimiento de contraseñas
sudo sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs
sudo sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   1/' /etc/login.defs

# Rondas de hashing
if ! grep -q "SHA_CRYPT_MIN_ROUNDS" /etc/login.defs; then
    echo "SHA_CRYPT_MIN_ROUNDS 5000" | sudo tee -a /etc/login.defs
    echo "SHA_CRYPT_MAX_ROUNDS 10000" | sudo tee -a /etc/login.defs
fi
```

### 3. Permisos y Limpieza

Los permisos laxos en archivos críticos son un vector de ataque clásico. Lynis marcó los directorios de cron como accesibles, así que los restringí a solo root (chmod 700), previniendo que un usuario malicioso programe tareas. Los banners en `/etc/issue` son avisos legales que disuaden a intrusos casuales y cumplen con estándares de seguridad. Finalmente, instalé AIDE (Advanced Intrusion Detection Environment) para monitorear cambios en archivos del sistema, y rkhunter para buscar rootkits. Vamos a desglosar cada comando:

- `sudo chmod 700 /etc/cron.d /etc/cron.daily /etc/cron.hourly /etc/cron.monthly /etc/cron.weekly`: Cambia permisos de estos directorios a 700 (solo owner puede leer/escribir/ejecutar), restringiendo acceso a root. `chmod` modifica permisos, `sudo` como root.
- `sudo chmod 600 /etc/crontab`: Similar, pero para el archivo crontab principal, permitiendo solo lectura/escritura a owner.

- `echo "Acceso restringido a usuarios autorizados. Toda actividad es monitoreada." | sudo tee /etc/issue /etc/issue.net`: `echo` imprime el texto, `|` lo pasa a `tee`, que escribe a ambos archivos (`/etc/issue` y `/etc/issue.net`). Estos banners aparecen en login, advirtiendo sobre monitoreo.

- `sudo dnf install -y aide rkhunter`: Instala paquetes `aide` y `rkhunter` usando DNF (gestor de paquetes de Fedora). `-y` asume yes a prompts.
- `sudo aide --init`: Inicializa la base de datos de AIDE, creando hashes de archivos del sistema para detectar cambios.
- `sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz`: Mueve la nueva base de datos a la ubicación estándar.

AIDE crea una base de datos de hashes; si algo cambia, lo detecta. Ejecuta `aide --check` semanalmente. Estos no rompen nada, pero asegúrate de que dnf esté actualizado.

```bash
# Restringir directorios de cron
sudo chmod 700 /etc/cron.d /etc/cron.daily /etc/cron.hourly /etc/cron.monthly /etc/cron.weekly
sudo chmod 600 /etc/crontab

# Banners legales
echo "Acceso restringido a usuarios autorizados. Toda actividad es monitoreada." | sudo tee /etc/issue /etc/issue.net

# Instalar herramientas de seguridad
sudo dnf install -y aide rkhunter
sudo aide --init
sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz
```

**AIDE, el paranoico que vigila tus archivos:** Mira, AIDE es como ese amigo desconfiado que anota todo lo que tienes en casa y te avisa si falta un calcetín. Funciona creando "huellas digitales" (hashes) de tus archivos importantes, y si un hacker o un virus los toca, te lo dice comparando. Lo instalé porque Lynis me gritó que no tenía nada para detectar intrusiones, y en mi Fedora, lo configuré manualmente para que no me moleste con actualizaciones legítimas. Lo corro cada semana con `sudo aide --check`, y si todo está bien, me deja en paz. Es gratis, efectivo, pero no lo dejes corriendo solo o te bombardeará con alertas falsas.

Cómo lo usé yo: Después de `sudo dnf install -y aide`, hice `sudo aide --init` para crear la base de hashes, moví el archivo a su sitio con `sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz`, y listo. Me funciona porque actualizo la base solo cuando hago cambios intencionales, evitando dramas innecesarios.

**Rkhunter, el cazador de bichos escondidos:** Este es como un sabueso barato que olfatea rootkits – esos programas malignos que se esconden como cucarachas bajo la nevera. No es un antivirus de verdad, solo un escáner que busca firmas conocidas y configuraciones raras. Lo metí en mi setup porque Lynis me dijo que estaba desnudo sin él, y en Fedora, lo corro manualmente después de instalar algo sospechoso. Tarda un rato, pero me da un reporte que dice "todo limpio" o "¡cuidado!". No me da falsos positivos si mantengo el sistema actualizado, y es perfecto para paranoicos como yo.

Cómo lo usé yo: `sudo dnf install -y rkhunter`, luego `sudo rkhunter --propupd` para crear un perfil "limpio" de mi sistema, y `sudo rkhunter --check` para escanear. Funciona porque no lo dejo corriendo todo el día, solo cuando lo necesito.

Armado con estas herramientas, me sentía invencible. Pero el sistema, traicionero como siempre, tenía una sorpresa preparada...

## El giro dramático: el comando que rompió todo

Todo iba bien. Lynis me dio un 70 inicial, apliqué los comandos, y subí a 75. Pero entonces, en un momento de euforia, añadí una línea que Lynis sugería: `kernel.modules_disabled = 1`. Era para "deshabilitar la carga de módulos después del arranque". Sonaba inofensivo, ¿verdad? Error. En Fedora, muchos drivers (como el del teclado USB, el controlador de disco NVMe o el módulo de red) se cargan dinámicamente durante el boot o al conectar dispositivos. Al bloquear la carga de nuevos módulos con ese parámetro, el kernel se quedó sin los drivers esenciales para interactuar con el hardware. Resultado: el sistema no podía acceder al disco, teclado o pantalla, y se quedaba en un loop de reinicio o directamente en la BIOS.

¿Signos de que algo iba mal? Pantalla negra al encender, sin mensajes de GRUB. Intenté forzar el menú de GRUB pulsando Shift repetidamente desde el arranque, pero nada aparecía porque el kernel no podía cargar el módulo de framebuffer o USB. Fue un "kernel panic" silencioso, donde el sistema detecta que no puede continuar y se detiene.

Solución: USB de instalación de Fedora. Arrancué desde ahí (elige "Try Fedora" para no instalar), y desde la terminal del live USB, monté mi disco duro para editar los archivos. ¿Por qué funciona? Porque el USB tiene su propio kernel intacto, y puedo acceder a los archivos del disco como si fueran una carpeta externa. Una vez borrados los archivos problemáticos, reinicié y Fedora volvió a la vida. Lección aprendida: `kernel.modules_disabled = 1` es genial para servidores headless que nunca cambian hardware, pero en un desktop con USBs, WiFi y periféricos, es una bomba de relojería. Siempre prueba cambios críticos en una VM primero.

### La reparación desde el USB
Vamos a desglosar cada paso de la reparación para que sepas exactamente qué hace cada comando y por qué es seguro:

- `sudo mkdir -p /mnt/repara`: Crea el directorio `/mnt/repara` si no existe (`-p` crea padres). `sudo` como root. Esto es un punto de montaje temporal.
- `sudo mount /dev/nvme0n1p3 /mnt/repara -o subvol=root`: Monta la partición `/dev/nvme0n1p3` (ajusta según tu disco, usa `lsblk` para ver) en `/mnt/repara`. `-o subvol=root` especifica el subvolumen BTRFS raíz en Fedora. Esto hace que los archivos del disco aparezcan como una carpeta accesible.
- `sudo rm /mnt/repara/etc/sysctl.d/99-lynis-hardening.conf`: Borra el archivo de configuración que contenía `kernel.modules_disabled = 1`. `rm` elimina, `sudo` como root.
- `sudo rm /mnt/repara/etc/modprobe.d/lynis-unused-protocols.conf`: Borra cualquier archivo de modprobe creado, por seguridad.
- `sudo umount /mnt/repara`: Desmonta la partición para evitar corrupciones. `umount` desconecta el punto de montaje.
- `sudo reboot`: Reinicia el sistema. Quita el USB antes de que arranque.

```bash
# Arrancar desde USB, elegir "Try Fedora"
# En la terminal del USB:
sudo mkdir -p /mnt/repara  # Crear un punto de montaje temporal
sudo mount /dev/nvme0n1p3 /mnt/repara -o subvol=root  # Montar la partición raíz (ajusta si es sda o diferente; usa lsblk para verificar)
sudo rm /mnt/repara/etc/sysctl.d/99-lynis-hardening.conf  # Borrar el archivo que causó el problema
sudo rm /mnt/repara/etc/modprobe.d/lynis-unused-protocols.conf  # Borrar también el de protocolos si existe
sudo umount /mnt/repara  # Desmontar para evitar corrupciones
sudo reboot  # Reiniciar y quitar el USB
```

¡Funciono! Fedora arrancó normal. Si tu partición es BTRFS (como en Fedora por defecto), el subvol=root asegura que montas la raíz correcta. Si no sabes la partición, ejecuta `lsblk` en el USB para ver cuál es (busca la más grande o con tipo "linux"). Este método es seguro porque no tocas el disco del USB, solo lees/escribes en el tuyo.

## El final feliz: Hardening Index en 75

Después de la reparación, volví a ejecutar Lynis. Índice: 75. Servicios blindados, kernel endurecido, auditoría activa. SELinux en enforcing, firewall activo. Mi Fedora ahora es una fortaleza. No perfecta (el 100 sería paranoico extremo), pero segura para uso diario.

Si tu Fedora te parece vulnerable, corre Lynis, pero ve con cuidado. Los comandos son poderosos, y a veces, como en mi caso, te dan un susto. Pero al final, vale la pena.

¡Nos vemos en el próximo log!