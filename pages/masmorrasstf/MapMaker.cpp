#include <raylib.h>
#include <stdio.h>
#include <math.h>
#include <string>
#define sW 900
#define sH 900
#define mH 9
#define mW 8
#define tileY (sH / mH)
#define tileX (sW / mW)
// struct tile {

// }

bool map[sH][sW][4] = {
    {
        {0, 0, 0, 0}
    }
};

int main() {
    InitWindow(sW, sH, "Mapman");

    int x = 0, y = 0;
    std::string out = "";
    Font cask = LoadFont("./CASKAYDIAMONONERDFONTMONO-BOLD.TTF");

    while(!WindowShouldClose()) {
        if(IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            x = floor(GetMouseX() / (tileX));
            y = floor(GetMouseY() / (tileY));

            TraceLog(LOG_INFO, "%d / %d = %d", GetMouseX(), sW, x);
            TraceLog(LOG_INFO, "%d / %d = %d", GetMouseY(), sH, y);
        }

        if(IsKeyPressed(KEY_UP) || IsKeyPressed(KEY_W))    map[x][y][0] = !map[x][y][0];
        if(IsKeyPressed(KEY_LEFT) || IsKeyPressed(KEY_A))  map[x][y][1] = !map[x][y][1];
        if(IsKeyPressed(KEY_RIGHT) || IsKeyPressed(KEY_D)) map[x][y][2] = !map[x][y][2];
        if(IsKeyPressed(KEY_DOWN) || IsKeyPressed(KEY_S))  map[x][y][3] = !map[x][y][3];

        BeginDrawing();
            ClearBackground(BLACK);
            for(int i = 0; i < mW; i++) {
                for(int j = 0; j < mH; j++) {
                    DrawRectangleLines(
                        i * tileX, j * tileY, tileX, tileY, DARKGRAY
                    );

                    if(map[i][j][0])
                        DrawLineEx(
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY - tileY
                            },
                            2.0,
                            WHITE
                        );
                    if(map[i][j][1])
                        DrawLineEx(
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            {
                                (float)(i + 1) * tileX - tileX,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            2.0,
                            WHITE
                        );
                    if(map[i][j][2]) 
                        DrawLineEx(
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            {
                                (float)(i + 1) * tileX,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            2.0,
                            WHITE
                        );
                    if(map[i][j][3]) 
                        DrawLineEx(
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY - tileY / 2
                            },
                            {
                                (float)(i + 1) * tileX - tileX / 2,
                                (float)(j + 1) * tileY
                            },
                            2.0,
                            WHITE
                        );

                    // DrawTextEx(cask, out.c_str(), {(float)i * tileX, (float)j * tileY}, 30, 2, WHITE);
                    // out = "";
                }
            }
            
            DrawRectangleLines(
                x * tileX, y * tileY, tileX, tileY, GREEN
            );
        EndDrawing();
    }

    UnloadFont(cask);
    CloseWindow();
    
    // char buffer[4096] = {0};

    // sprintf(buffer, "const map = [");
    out = "";
    out = "const map = [\n";
    for(int i = 0; i < mH; ++i) {
        out += "\t[\n";
        // sprintf(buffer, "[");
// 
        for(int j = 0; j < mW; ++j) {
            // sprintf(buffer, "\t[ %d, %d, %d, %d ],\n",
            //     map[i][j][0], map[i][j][1], map[i][j][2], map[i][j][3]
            // );
            out += "\t\t[";
            out += map[i][j][0]? " 1, " : " 0, ";
            out += map[i][j][1]? "1, " : "0, ";
            out += map[i][j][2]? "1, " : "0, ";
            out += map[i][j][3]? "1 " : "0 ";
            out += "],\n";
        }

        // sprintf(buffer, "],\n");
        out += "\t],\n";
    }
    // sprintf(buffer, "]");
    out += "\n];";

    fflush(stdout);
    printf("%s", out.c_str());
    fflush(stdout);
}