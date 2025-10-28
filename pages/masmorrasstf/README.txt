Como compilar:
    Instale Raylib de https://raylib.com
    Rode o comando abaixo e troque [RL] pelo caminho no qual você instalou Raylib

[RL]/w64devkit/bin/g++.exe -o main.exe .\main.cpp -I[RL]\raylib\src [RL]\raylib\src\raylib.rc.data -O3 -Wall -Wextra -Iexternal -DPLATFORM_DESKTOP -lm -ggdb -lraylib -lopengl32 -lgdi32 -lwinmm

Requerimentos:
    Intel I10 500GHz
    128GB RAM DDR7
    1TB disco disponível
    NVidia RTX 8090