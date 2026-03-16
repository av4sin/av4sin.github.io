---
layout: post
title: "Sacar trazas con Extrae y convertirlas a Paraver con Makefile"
date: 2026-03-15
categories: [tecnico, linux, openmp]
tags: [extrae, paraver, makefile, openmp, trazas]
---

Vale, pues ahí os va: guía para usar y sacar las trazas.

## 1) Comprobar que todo compila

Primero que nada, necesitamos asegurarnos de que todo está funcionando y compilando, como hemos hecho otras veces. Se puede hacer simplemente con:

```bash
make clean && make
```

## 2) Preparar el fichero XML de Extrae

Ahora ya sabemos que compila. Para poder extraer y que funcione Extrae (por redundante que suene), necesitamos un fichero `XML`. Este fichero tiene que contener la configuración de Extrae. No necesita ser nada complejo, aunque, dado que Extrae es para servidores y clústeres empresariales, se puede complicar tanto como queramos.

El fichero que hice yo el otro día es este:

```xml
<extrae>
    <version>3.0</version>
    <configuration>
        <program>
            <name>./app.out</name>
            <arguments></arguments>
        </program>
        <trace>
            <output>trace_output.prv</output>
            <format>paraver</format>
        </trace>
        <openmp>
            <enabled>true</enabled>
        </openmp>
    </configuration>
</extrae>
```

Como veis, lo que hace es coger el `app.out` que nos generaba el `Makefile` en ejercicios anteriores y extraer las trazas con formato Paraver en un fichero llamado `trace_output.prv`, además de habilitar OpenMP. Nada del otro mundo. La cosa es que esto necesita funcionar porque un `XML` es como un `TXT`: sin un programa que lo use para algo, por sí solo no ejecuta nada.

## 3) Añadir la opción `trace` al `Makefile`

Ahí es donde entra en juego el `Makefile`, al que añadí la opción `trace` para que simplemente haya que ejecutar `make trace` y te genere una carpeta con la marca temporal y las trazas.

```makefile
CXX = g++

EXTRAE_HOME = /opt/extrae
EXTRAE_INC  = -I$(EXTRAE_HOME)/include
EXTRAE_LIBS = -L$(EXTRAE_HOME)/lib -lpttrace -lomptrace

CXXFLAGS = -std=c++17 -Wall -O2 -fopenmp $(EXTRAE_INC) `pkg-config --cflags opencv4`
LDFLAGS = -fopenmp $(EXTRAE_LIBS) `pkg-config --libs opencv4`
SRC_DIRS = ../Exercise_3 ../Exercise_3/DirectoryImageReaderParallel ../Exercise_3/GaussianImageConverterParallel ../Exercise_3/GrayscaleImageConverterParallel ../Exercise_3/MaxPoolingConversorParallel ../Exercise_3/PiCalculatorParallel ../Exercise_3/SortNumbersParallel ../Exercise_3/SudokuParallel ../Exercise_3/WordCountParallel ../Exercise_2/DirectoryImageReader ../Exercise_2/GaussianImageConverter ../Exercise_2/GrayscaleImageConverter ../Exercise_2/MaxPoolingConversor ../Exercise_2/PiCalculator ../Exercise_2/SortNumbers ../Exercise_2/Sudoku ../Exercise_2/WordCount
SRCS = $(foreach dir,$(SRC_DIRS),$(wildcard $(dir)/*.cpp))
OBJS = $(SRCS:.cpp=.o)
TARGET = app.out

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(OBJS) -o $(TARGET) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)
	rm -f *.prv *.pcf *.row TRACE.mpits TRACE.sym
	rm -rf set-0

TIMESTAMP = $(shell date +%Y%m%d_%H%M%S)
RESULT_DIR = ../Traces/trace_$(TIMESTAMP)

trace: $(TARGET)
	@echo "Creando carpeta $(RESULT_DIR)..."
	@mkdir -p $(RESULT_DIR)
	@echo "Configurando Extrae..."
	export EXTRAE_CONFIG_FILE=extrae.xml; \
	export EXTRAE_ON=1; \
	export EXTRAE_FINAL_DIR=$(RESULT_DIR); \
	./$(TARGET)
	@echo "Generando la traza de Paraver..."
	mpi2prv -f $(RESULT_DIR)/TRACE.mpits -o $(RESULT_DIR)/trace_$(TIMESTAMP).prv
	@echo "Finalizado. Traza: $(RESULT_DIR)/trace_$(TIMESTAMP).prv"

.PHONY: all clean trace
```

Este `Makefile` está en la carpeta del ejercicio 4, por lo que hay que redireccionar las carpetas de los otros ejercicios y poco más en comparación con los anteriores. El `app.out` lo genera en la propia carpeta en la que se encuentra (es decir, en la del ejercicio 4), por si os resulta complicado buscarlo.

## 4) Explicación rápida de las opciones nuevas

Primero, después de decir qué compilador va a usar, establece los parámetros en los que indica dónde se encuentra Extrae, la aplicación para usarla, los `include` y las librerías. En las `flags` del compilador añade el directorio de `include` de Extrae, y en las `flags` de librerías, junto con `-fopenmp`, pone también las librerías de Extrae.

Por lo demás, todo sigue igual hasta el `clean`. Al final, lo único que tiene son dos argumentos más para el `rm -rf`, para limpiar la última traza si no se ha guardado en una carpeta.

Después es donde llega la cosa interesante. El `timestamp` lo puse para poder diferenciar las trazas fácilmente por fecha y hora. Luego lo que hace es ir al directorio anterior y meterse en la carpeta que nos daban (`Traces`) y seleccionar la que se llama `trace_$(TIMESTAMP)`, siendo el `timestamp` el que hemos puesto antes, que lo coge automáticamente de la hora del sistema.

Y de ahí entramos en la opción `trace`, que al fin y al cabo no deja de ser como una especie de función o método de `make`. Recibe como argumento el `TARGET`, que si os fijáis más arriba es `app.out`, y pone primero un `echo` para imprimir por pantalla qué está ocurriendo en cada paso y, si se queda algo pillado, identificar qué parte ha fallado. Con `mkdir` hacemos la carpeta donde vamos a almacenar el resultado de la traza, y de ahí pasamos a configurar Extrae:

```bash
export EXTRAE_CONFIG_FILE=extrae.xml
export EXTRAE_ON=1
export EXTRAE_FINAL_DIR=$(RESULT_DIR)
```

La opción diferente que tiene es la de `EXTRAE_FINAL_DIR`, que nos permite guardar los resultados en una carpeta personalizada. En este caso, es la que hemos preparado con el `timestamp`. Después de configurar los parámetros de Extrae, si os fijáis, está `./$(TARGET)`, que solo ejecuta el `app.out` sin opciones extra ni cosas raras.

Por último, lo que hace con `mpi2prv` es transformarlo de `mpits` al `trace_$(TIMESTAMP).prv`, que está en el primer nivel del directorio en el que lo hemos extraído. Cuando termina, te indica que ha finalizado y te da el directorio donde encontrar la traza.

## 5) Extraer las trazas

![Captura 1 - ejecución y traza]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_091803.png' | relative_url }})

![Captura 2 - resultado intermedio]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_091927.png' | relative_url }})

![Captura 3 - resultado intermedio 2]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_092121.png' | relative_url }})

![Captura 4 - resultado tras generar la traza]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_092726.png' | relative_url }})

![Captura 5 - abrimos wxparaver]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_092922.png' | relative_url }})

![Captura 6 - navegamos al directorio]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_093013.png' | relative_url }})

![Captura 7 - doble click en la traza]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_093038.png' | relative_url }})

![Captura 8 - nueva ventana]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_093052.png' | relative_url }})

![Captura 9 - resultado final]({{ '/assets/img/posts/2026-03-15-sacar-trazas-con-extrae/Captura%20de%20pantalla_20260316_093137.png' | relative_url }})