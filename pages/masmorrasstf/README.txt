I. Como compilar:
    Instale Raylib de https://raylib.com
    Rode o comando abaixo e troque [RL] pelo caminho no qual você instalou Raylib

[RL]/w64devkit/bin/g++.exe -o main.exe .\main.cpp -I[RL]\raylib\src [RL]\raylib\src\raylib.rc.data -O3 -Wall -Wextra -Iexternal -DPLATFORM_DESKTOP -lm -ggdb -lraylib -lopengl32 -lgdi32 -lwinmm

I.1 Como compilar para WASM
    Caso alguém queira fazer,
    * requere:
        * WSL2
    * Troque [emsd] pelo local onde foi clonado emsdk

    Passo a passo ==>
        # buildando o raylib normal
            git clone https://github.com/raysan5/raylib --depth 1
            cd raylib/
            cmake -B build -DBUILD_SHARED_LIBS=ON
            cd build
            make 
            sudo make install
        # instalando emsdk
            git clone https://github.com/emscripten-core/emsdk --depth 1
            cd emsdk
            ./emsdk install latest
            ./emsdk activate latest
            source ./emsdk_env.sh
        # buildando raylib WASM
            cd ../raylib/src
            make PLATFORM=PLATFORM_WEB EMSDK_PATH=[emsdk]
        # buildando o projeto 
        # !! O PROJETO NÃO FOI TESTADO PARA COMPILAR SOB EMCC
        # !! PROVAVELMENTE VAI DAR MUITOS ERROS
            cd [xandao-bet]/pages/masmorrasstf
            emcc -o masmorra.html main.cpp -Os -Wall -std=c++11 \
                /home/$USER/raylib/src/web/libraylib.web.a \
                -I. -I /home/$USER/raylib/src \
                -L. -L /home/$USER/raylib/src \
                -s USE_GLFW=3 \
                -s ASYNCIFY \
                --shell-file /home/$USER/raylib/src/shell.html \
                -DPLATFORM_WEB

    

II. Requerimentos:
    Intel I10 500GHz
    128GB RAM DDR7
    1TB disco disponível
    NVidia RTX 8090