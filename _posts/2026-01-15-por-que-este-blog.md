---
layout: post
title: "Por que este blog: de Kali a Fedora y la necesidad de documentar"
date: 2026-01-15
categories: [reflexiones, linux]
tags: [blog, kali, fedora, migracion, documentacion]
featured: true
---

## El origen de todo

Llevo anos usando ordenadores. Programando. Rompiendo cosas. Arreglandolas. Y en algun momento de ese ciclo infinito de prueba y error, me di cuenta de algo: **se me olvida todo**.

No es que tenga mala memoria. Es que la cantidad de problemas que resuelvo, configuraciones que hago, y soluciones que encuentro es tan grande que resulta imposible retenerlo todo. Y lo peor no es olvidarlo. Lo peor es volver a enfrentarte al mismo problema seis meses despues y no recordar como lo solucionaste.

Este blog nace de esa frustracion.

---

## La gota que colmo el vaso

Hace unos dias tome una decision que llevaba tiempo posponiendo: **migrar de Kali Linux a Fedora**.

Kali habia sido mi sistema operativo principal durante mucho tiempo. Si, se que no esta pensado para eso. Si, se que es una distribucion orientada a seguridad y pentesting. Pero funcionaba, me sentia comodo, y tenia todo configurado a mi gusto.

Hasta que dejo de tener sentido.

Fedora me atraia por su estabilidad, su ciclo de actualizaciones, y por probar algo diferente. Asi que un dia, armado de valor y de un disco duro externo, decidi dar el salto.

---

## El desastre

La migracion empezo bien. Demasiado bien.

Instale Fedora sin problemas. Actualice el sistema. Configure el entorno. Todo fluia. Y entonces llego el momento de copiar mis archivos del disco de respaldo.

**Copie todo de golpe.**

Miles de archivos. Configuraciones. Proyectos. Dotfiles. Scripts. Todo mezclado en una operacion masiva que, en retrospectiva, fue un error de principiante.

Los problemas empezaron a aparecer uno detras de otro:

- Permisos incorrectos en archivos criticos
- Configuraciones de Kali que chocaban con Fedora
- Dependencias rotas
- Scripts que llamaban a rutas que ya no existian
- Archivos ocultos que sobrescribieron configuraciones por defecto

Mi flamante instalacion de Fedora se convirtio en un frankenstein de dos sistemas operativos que no debian mezclarse.

---

## La busqueda de respuestas

Pase horas. Muchas horas.

Foros de Fedora. Stack Overflow. Reddit. La wiki de Arch (porque la wiki de Arch siempre tiene la respuesta, aunque no uses Arch). Documentacion oficial. Posts de blogs olvidados de 2019 que de alguna manera seguian siendo relevantes.

Poco a poco fui solucionando cada problema. Aprendiendo por que habia fallado. Entendiendo las diferencias entre distribuciones que daba por sentadas.

Y cuando termine, cuando finalmente todo funcionaba, me sente satisfecho.

Durante cinco minutos.

Porque entonces me di cuenta: **no habia anotado nada**.

---

## La revelacion

Todo ese conocimiento que acababa de adquirir, todas esas soluciones que habia encontrado tras horas de investigacion, estaban solo en mi cabeza. Y mi cabeza, como ya he dicho, no es de fiar.

Dentro de unos meses volvere a enfrentarme a algo similar. O alguien que conozco tendra un problema parecido. Y no tendre nada que mostrarle. Nada que consultar. Tendre que empezar de cero.

Es absurdo.

Y entonces pense: **¿por que no hacerlo publico?**

Si voy a documentar mis soluciones, ¿por que guardarlas solo para mi? Hay miles de personas que se enfrentan a los mismos problemas. Que buscan las mismas respuestas en los mismos foros a las tres de la madrugada. Que merecen encontrar una solucion clara y directa en lugar de tener que reconstruirla desde fragmentos dispersos por toda la red.

---

## Lo que busco con este blog

Este blog no pretende ser una guia definitiva de nada. No soy un experto. Soy un informatico que resuelve problemas, a veces con elegancia y a veces a base de prueba y error.

Lo que encontraras aqui:

- **Soluciones tecnicas detalladas** a problemas reales que me han surgido
- **Proyectos personales** documentados paso a paso
- **Reflexiones** sobre tecnologia, desarrollo y el proceso de aprender
- **Errores** que he cometido y como los he solucionado (o no)

No me importa si un post lo lee una persona o mil. Lo importante es que este escrito. Que exista. Que cuando yo mismo lo necesite dentro de seis meses, pueda encontrarlo.

Y si de paso le sirve a alguien mas, mejor.

---

## Una huella digital

Vivimos en una era donde todo es efimero. Las publicaciones desaparecen en el ruido. Los mensajes se pierden en grupos de cientos de conversaciones. El conocimiento se fragmenta y se dispersa.

Este blog es mi forma de resistir eso. De dejar algo solido. Algo que permanezca.

Una huella digital.

Mi nombre es Gonzalo, me conocen como av4sin, y esto es lo que se.

Bienvenido.
