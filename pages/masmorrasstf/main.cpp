#include <raylib.h>
#include <string>
#include <vector>
#include <rlgl.h>
#include <cstring>
#include <chrono>

using namespace std::chrono;
using namespace std::chrono_literals;

#define FOV 120.0f
#define TIMEOUT 1s
#define MAP_WIDTH 8
#define MAP_HEIGHT 9
#define TRANSITION_TIMEOUT 200ms
#define FSTR \ 
"0:0, 0 0, 0 0, 1 1, 0 0;\
0:1, 0 0, 0 0, 1 1, 0 0;\
0:2, 1 1, 0 0, 0 0, 0 0;\
0:3, 1 1, 1 1, 0 0, 0 0;\
0:4, 0 0, 1 1, 1 1, 0 0;\
0:5, 0 0, 0 0, 1 1, 0 0;\
0:6, 1 1, 0 0, 0 0, 0 0;\
0:7, 1 1, 0 0, 1 1, 0 0;\
1:0, 0 0, 0 0, 1 1, 1 1;\
1:1, 0 0, 0 0, 1 1, 1 1;\
1:2, 1 1, 0 0, 1 1, 0 0;\
1:3, 1 1, 1 1, 0 0, 0 0;\
1:4, 0 0, 1 1, 0 0, 1 1;\
1:5, 0 0, 0 0, 1 1, 1 1;\
1:6, 0 0, 0 0, 0 0, 0 0;\
1:7, 0 0, 0 0, 1 1, 1 1;\
2:0, 1 1, 0 0, 0 0, 1 1;\
2:1, 1 1, 1 1, 0 0, 1 1;\
2:2, 1 1, 1 1, 0 0, 1 1;\
2:3, 1 1, 1 1, 0 0, 0 0;\
2:4, 1 1, 1 1, 1 1, 0 0;\
2:5, 1 1, 1 1, 1 1, 1 1;\
2:6, 0 0, 1 1, 1 1, 0 0;\
2:7, 0 0, 0 0, 1 1, 1 1;\
3:0, 1 1, 0 0, 1 1, 0 0;\
3:1, 1 1, 1 1, 0 0, 0 0;\
3:2, 1 1, 1 1, 1 1, 0 0;\
3:3, 0 0, 1 1, 1 1, 0 0;\
3:4, 0 0, 0 0, 1 1, 1 1;\
3:5, 0 0, 0 0, 0 0, 1 1;\
3:6, 1 1, 0 0, 0 0, 1 1;\
3:7, 0 0, 1 1, 1 1, 1 1;\
4:0, 1 1, 0 0, 0 0, 1 1;\
4:1, 0 0, 1 1, 1 1, 0 0;\
4:2, 0 0, 0 0, 1 1, 1 1;\
4:3, 1 1, 0 0, 0 0, 1 1;\
4:4, 1 1, 1 1, 0 0, 1 1;\
4:5, 1 1, 1 1, 0 0, 0 0;\
4:6, 1 1, 1 1, 0 0, 0 0;\
4:7, 0 0, 1 1, 0 0, 1 1;\
5:0, 1 1, 0 0, 1 1, 0 0;\
5:1, 0 0, 1 1, 1 1, 1 1;\
5:2, 1 1, 0 0, 0 0, 1 1;\
5:3, 1 1, 1 1, 1 1, 0 0;\
5:4, 1 1, 1 1, 0 0, 0 0;\
5:5, 0 0, 1 1, 1 1, 0 0;\
5:6, 0 0, 0 0, 0 0, 0 0;\
5:7, 0 0, 0 0, 0 0, 0 0;\
6:0, 0 0, 0 0, 1 1, 1 1;\
6:1, 0 0, 0 0, 1 1, 1 1;\
6:2, 1 1, 0 0, 1 1, 0 0;\
6:3, 1 1, 1 1, 0 0, 1 1;\
6:4, 0 0, 1 1, 1 1, 0 0;\
6:5, 0 0, 0 0, 1 1, 1 1;\
6:6, 0 0, 0 0, 0 0, 0 0;\
6:7, 0 0, 0 0, 0 0, 0 0;\
7:0, 0 0, 0 0, 1 1, 1 1;\
7:1, 1 1, 0 0, 0 0, 1 1;\
7:2, 0 0, 1 1, 0 0, 1 1;\
7:3, 0 0, 0 0, 1 1, 1 1;\
7:4, 0 0, 0 0, 0 0, 0 0;\
7:5, 0 0, 0 0, 1 1, 1 1;\
7:6, 0 0, 0 0, 0 0, 0 0;\
7:7, 0 0, 0 0, 0 0, 0 0;\
8:0, 1 1, 0 0, 0 0, 1 1;\
8:1, 1 1, 1 1, 0 0, 0 0;\
8:2, 1 1, 1 1, 0 0, 0 0;\
8:3, 1 1, 1 1, 0 0, 0 0;\
8:4, 0 0, 1 1, 0 0, 1 1;\
8:5, 1 1, 0 0, 0 0, 1 1;\
8:6, 0 0, 1 1, 1 1, 0 0;\
8:7, 0 0, 0 0, 0 0, 0 0;"

#define ARR_LEN(arr) (sizeof(arr) / sizeof(arr[0]))

void DrawLeftWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color); // Draw cube textured
void DrawRightWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color); // Draw cube textured
void DrawFrontWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color); // Draw cube textured
void DrawFloor(Texture2D texture, Vector3 position, float width, float height, float length, Color color); // Draw cube textured
void DrawCeiling(Texture2D texture, Vector3 position, float width, float height, float length, Color color); // Draw cube textured

Texture2D LoadTextureRot(const char *fileName, int deg)
{
    Texture2D texture = { 0 };

    Image image = LoadImage(fileName);

    if (image.data != NULL)
    {
        ImageRotate(&image, deg);
        texture = LoadTextureFromImage(image);
        UnloadImage(image);
    }

    return texture;
}

inline float Lerp(float start, float end, float amount)
{
    return  start + amount*(end - start);
}

void DrawCenteredText(const char* text, int fontSize, Color color, int xOffset = 0, int yOffset = 0) {
    // Get the size of the text to draw
    Vector2 textSize = MeasureTextEx(GetFontDefault(), text, fontSize, fontSize*.1f);
    
    Vector2 textPos = (Vector2) {
        Lerp(0.0f, GetScreenWidth()  - textSize.x + xOffset, 1.0f * 0.5f),
        Lerp(0.0f, GetScreenHeight() - textSize.y + yOffset, 1.0f * 0.5f)
    };
    
    // Draw the text
    DrawTextEx(GetFontDefault(), text, textPos, fontSize, fontSize*.1f, color);
}

Texture2D textureDict[32] = {};

std::string map[] = {
    "LEFT",
    "RIGHT",
    "BACK",
    "FRONT",
};
enum Direction {
    LEFT =      0,
    RIGHT =     1,
    BACK =      2,
    FRONT =   3,
};

template <typename T = int>
struct Passage {
    bool passable;
    T path;

    Passage(bool pass, T p) {
        memcpy(&path, &p, sizeof(p));
        passable = pass;
    }

    Passage() {

    }
};

struct ShallowRoom {

    Passage<> paths[4];

    ShallowRoom() {
        paths[LEFT] = {false, {}};
        paths[RIGHT] = {false, {}};
        paths[BACK] = {false, {}};
        paths[FRONT] = {false, {}};
    }
    ShallowRoom(
        Passage<> left, 
        Passage<> right, 
        Passage<> front, 
        Passage<> back
    ) {
        paths[LEFT] = {left};
        paths[RIGHT] = {right};
        paths[BACK] = {back};
        paths[FRONT] = {front};
    }
};

struct Room {
    Passage<Texture2D*> paths[4];

    Room() {
        paths[LEFT] = {false, {}};
        paths[RIGHT] = {false, {}};
        paths[BACK] = {false, {}};
        paths[FRONT] = {false, {}};
    }
    Room(
        Passage<Texture2D*> left, 
        Passage<Texture2D*> right, 
        Passage<Texture2D*> front, 
        Passage<Texture2D*> back
    ) {
        paths[LEFT] = {left};
        paths[RIGHT] = {right};
        paths[BACK] = {back};
        paths[FRONT] = {front};
    }
};

Room LoadRoom(ShallowRoom reference) {
    return {
        Passage<Texture2D*> {
            reference.paths[LEFT].passable,
            &textureDict[reference.paths[LEFT].path]
        },
        Passage<Texture2D*> {
            reference.paths[RIGHT].passable,
            &textureDict[reference.paths[RIGHT].path]
        },
        Passage<Texture2D*> {
            reference.paths[FRONT].passable,
            &textureDict[reference.paths[FRONT].path]
        },
        Passage<Texture2D*> {
            reference.paths[BACK].passable,
            &textureDict[reference.paths[BACK].path]
        },
    };
}

void DrawMiniMap(Room room, Direction facing, bool destroy = false) {
    static Texture2D tmp[4] = {
        LoadTextureRot("res/player.png", 90),
        LoadTextureRot("res/player.png", -90),
        LoadTextureRot("res/player.png", 180),
        LoadTextureRot("res/player.png", 0),
    };

    if(destroy) {
        for(auto icon : tmp) {
            UnloadTexture(icon);
        }
        return;
    }

    DrawRectangle(20, 20, 30, 30, BLACK);
    DrawRectangleLinesEx({20, 20, 30, 30}, 2.0f, GRAY);
    DrawTexture(
        tmp[facing],
        (20 + 15) - tmp[facing].width / 2, (20 + 15) - tmp[facing].height / 2, WHITE);    
}

void TurnLeft(Direction& facing) {
    switch(facing) {
        case LEFT:
            facing = BACK;
        break;
        case RIGHT:
            facing = FRONT;
        break;
        case FRONT:
            facing = LEFT;
        break;
        case BACK:
            facing = RIGHT;
        break;
    }
}


template<typename T = Room>
bool Walk(unsigned int& cY, unsigned int& cX, T room, Direction facing, bool forward = true) {
    switch(facing) {
        case LEFT: {
            if(!room.paths[LEFT].passable && forward)
                return true;
            else if(!room.paths[RIGHT].passable && !forward)
                return true;
            else {
                if(forward) cX++;
                else cX--;
            }                
        }; break;

        case RIGHT: {
            if(!room.paths[RIGHT].passable && forward)
                return true;
            else if(!room.paths[LEFT].passable && !forward)
                return true;
            else {
                if(forward) cX--;
                else cX++;
            }
        }; break;

        case FRONT: {
            if(!room.paths[FRONT].passable && forward)
                return true;
            else if(!room.paths[BACK].passable && !forward)
                return true;
            else 
            {
                if(forward) cY++;
                else cY--;
            }
        }; break;

        case BACK: {
            if(!room.paths[BACK].passable && forward)
                return true;
            else if(!room.paths[FRONT].passable && !forward)
                return true;
            else {
                if(forward) cY--;
                else cY++;
            }
        }; break;
    }

    return false;
}

void TurnRight(Direction& facing) {
    switch(facing) {
        case LEFT:
            facing = FRONT;
        break;
        case RIGHT:
            facing = BACK;
        break;
        case FRONT:
            facing = RIGHT;
        break;
        case BACK:
            facing = LEFT;
        break;
    }
}

struct Lula {
    unsigned int x;
    unsigned int y;
};

void LulaWalk(ShallowRoom room, Lula& lula) {
    Direction lulaBuffer[4];
    if(rand() % 3 == 1) {
        lula = {
                (unsigned int)(rand() % MAP_WIDTH),
                (unsigned int)(rand() % MAP_HEIGHT),
            };
            return;
    }
    else {
        int top = 0;
        for(int i = 0; i < 4; ++i) {
            if(room.paths[i].passable) {
                lulaBuffer[top++] = (Direction)i;
            }
        }

        if(top == 0) {
            lula = {
                (unsigned int)(rand() % MAP_WIDTH),
                (unsigned int)(rand() % MAP_HEIGHT),
            };
            return;
        }

        if(Walk<ShallowRoom>(lula.x, lula.y, room, lulaBuffer[rand() % 4])) {
            lula = {
                (unsigned int)(rand() % MAP_WIDTH),
                (unsigned int)(rand() % MAP_HEIGHT),
            };
        }
    }
}

enum AppState {
    DEFAULT,
    WALK_IN,
    WALK_OUT,
    AWAIT,
    INIT,
};

#define DARKNESS 6

int main(void)
{
    const int screenWidth = 800;
    const int screenHeight = 450;

    InitWindow(screenWidth, screenHeight, "Masmorras do STF");
    InitAudioDevice();
    
    textureDict[0] = LoadTextureRot("./res/bricks.png", 180);
    textureDict[1] = LoadTextureRot("./res/path.png", 180);
    textureDict[2] = LoadTextureRot("./res/carpet.png", 180);
    textureDict[3] = LoadTextureRot("./res/dirt.png", 180);


    Camera camera = { 0 };
    camera.position = (Vector3){ 0.0f, 1.0f, 0.0f };
    camera.target = (Vector3){ 0.0f, 1.0f, 1.0f };
    camera.up = (Vector3){ 0.0f, 1.0f, 0.0f };
    camera.fovy = FOV;
    camera.projection = CAMERA_PERSPECTIVE;
    SetTargetFPS(60);

    Direction facing = FRONT;
    bool updateWalls = true;

    unsigned int cX = 0, cY = 0;
    int endX, endY;

    ShallowRoom rooms[9][9];

    std::string file = FSTR;

    Texture2D floorTexture = LoadTextureRot("./res/carpet.png", 0);
    Sound footsteps = LoadSound("res/walk.wav");
    // bool walking = false;

    Room room {};

    Passage<Texture2D*>* frontWall;
    Passage<Texture2D*>* leftWall;
    Passage<Texture2D*>* rightWall;
    float opacity = 0.0f;
    AppState state = INIT;
    AppState stateCopy = INIT;
    bool debug = false;

    rlDisableBackfaceCulling();
    
    char* token = strtok((char*)file.c_str(), ";");
    while(token) {
        int x, y;
        ShallowRoom tmp;

        if(sscanf(
            token,
            "%d:%d, %d %d, %d %d, %d %d, %d %d",
                &x, &y,
                &tmp.paths[LEFT].passable,     &tmp.paths[LEFT].path,
                &tmp.paths[RIGHT].passable,    &tmp.paths[RIGHT].path,
                &tmp.paths[FRONT].passable,    &tmp.paths[FRONT].path,
                &tmp.paths[BACK].passable,     &tmp.paths[BACK].path
            ))     
                rooms[x][y] = ShallowRoom{tmp};
            else if(sscanf(
                token,
                ">%d %d",
                    &endX, &endY));
        else TraceLog(LOG_FATAL, "Parsing error for file at token '%d'", token);

        token = strtok(NULL, ";");
    }
    room = LoadRoom(rooms[0][0]);

    Lula lula = {
        rand() % MAP_WIDTH, rand() % MAP_HEIGHT
    };

    do {
        lula = {
            (unsigned int)rand() % MAP_WIDTH, (unsigned int)rand() % MAP_HEIGHT
        };
    } while(lula.x = 0 || lula.y == 0);

    auto timer = system_clock::now();
    bool died = 0;
    while (!WindowShouldClose())
    {
        if(died) {
            if(opacity < 2.6) opacity += 0.1;

            BeginDrawing();
                DrawRectangle(0, 0, screenWidth, screenHeight, RED);
                
                if(opacity == 2.5) DrawCenteredText("Você foi lulado.", 60, WHITE);
            EndDrawing();
            continue;
        }

        if(state == INIT) {
            BeginDrawing();
                // switch() {
                    // case -5: {
                        if(IsKeyPressed(KEY_SPACE)) state = DEFAULT;

                        ClearBackground(BLACK);
                        int fontSize = 40;
                        char passages[][64] = {
                            "A energia caiu",
                            "durante o julgamento do",
                            "Bolsonaro",
                        };

                        DrawCenteredText(passages[0], fontSize, WHITE);
                        DrawCenteredText(passages[1], fontSize, WHITE, 0, fontSize * 2);
                        DrawCenteredText(passages[2], fontSize, GREEN, 0, fontSize * 4);

                        if(duration_cast<seconds>(system_clock::now() - timer) >= TIMEOUT)
                            DrawText("Aperte espaço para continuar", 10, screenHeight - 20, 10, WHITE);
                    // } break;    
                // }
            EndDrawing();
            continue;
        }

        if(IsKeyPressed(KEY_LEFT))
        {
            TurnLeft(facing);
            updateWalls = true;
        }
        else if(IsKeyPressed(KEY_RIGHT))
        {
            TurnRight(facing);
            updateWalls = true;
        }
        else if(IsKeyPressed(KEY_UP))
        {
            if(!Walk(cY, cX, room, facing))
            {
                if(cY < 0 )                      cY++;
                else if(cY >= ARR_LEN(rooms))    cY--;
                else if(cX < 0 )                 cX++;
                else if(cX >= ARR_LEN(rooms))    cX--;
                else
                {
                    // if(IsSoundPlaying(footsteps)) StopSound(footsteps);
                    // PlaySound(footsteps);

                    state = WALK_IN;
                    TraceLog(LOG_INFO, " ==> %d", rooms[cY][cX].paths[BACK].path);
                    // updateWalls = true;
                }
            }
        }
        else if(IsKeyPressed(KEY_DOWN))
        {
            if(!Walk(cY, cX, room, facing, false))
            {
                if(cY < 0 )                      cY++;
                else if(cY >= ARR_LEN(rooms))    cY--;
                else if(cX < 0 )                 cX++;
                else if(cX >= ARR_LEN(rooms))    cX--;
                else
                {
                    // if(IsSoundPlaying(footsteps)) StopSound(footsteps);
                    // PlaySound(footsteps);

                    state = WALK_IN;
                    TraceLog(LOG_INFO, " ==> %d", rooms[cY][cX].paths[BACK].path);
                    room = LoadRoom(rooms[cY][cX]);
                    // updateWalls = true;
                }
            }
        }
        else if(IsKeyPressed(KEY_D)) debug = !debug;

        if(updateWalls) {
            switch(facing) {
                case BACK:
                    frontWall = &room.paths[BACK];
                    leftWall = &room.paths[RIGHT];
                    rightWall = &room.paths[LEFT];
                break;
                case FRONT:
                    frontWall = &room.paths[FRONT];
                    leftWall = &room.paths[LEFT];
                    rightWall = &room.paths[RIGHT];
                break;
                case LEFT:
                    frontWall = &room.paths[LEFT];
                    leftWall = &room.paths[BACK];
                    rightWall = &room.paths[FRONT];
                break;
                case RIGHT:
                    frontWall = &room.paths[RIGHT];
                    leftWall = &room.paths[FRONT];
                    rightWall = &room.paths[BACK];
                break;
            }
            LulaWalk(rooms[lula.x][lula.y], lula);
            TraceLog(LOG_INFO, "ELE %d %d", lula.x, lula.y);
        }

        if(state == 1)
        {
            if(camera.fovy < 50) {
                TraceLog(LOG_INFO, "%.1f", camera.fovy);
                state = WALK_OUT;
            }
            else camera.fovy *= 0.90;   
        }
        else if(state == 2)
        {
            if(camera.fovy >= FOV) {
                camera.fovy = FOV;
                state = DEFAULT;
                room = LoadRoom(rooms[cY][cX]);
            }
            else camera.fovy *= 1.85;
        }

        BeginDrawing();
            ClearBackground(RAYWHITE);

            BeginMode3D(camera);

                DrawLeftWall(*leftWall->path, (Vector3){ 2.0f, 1.0f, 0.0f }, 2.0f, 2.0f, 2.0f, WHITE);
                DrawRightWall(*rightWall->path, (Vector3){ -2.0f, 1.0f, 0.0f }, 2.0f, 2.0f, 2.0f, WHITE);
                DrawFrontWall(*frontWall->path, (Vector3){ 0.0f, 1.0f, 2.0f }, 2.0f, 2.0f, 2.0f, WHITE);
                DrawFloor(floorTexture, (Vector3){ 0.0f, 0.0f, 0.0f }, 2.0f, 1.0f, 2.0f, WHITE);
                DrawCeiling(floorTexture, (Vector3){ 0.0f, 2.5f, 0.0f }, 2.0f, 1.0f, 2.0f, WHITE);
                
                DrawSphere(camera.position, 0.5f, {0, 0, 0, 100});
                DrawSphere(camera.position, 1.0f, {0, 0, 0, 150});
                // DrawCube(camera.position, 1, 1, 1, BLACK);
                // Drawsh
            EndMode3D();

            if(debug) {
                DrawFPS(10, 10);
                DrawText(TextFormat("X %d Y %d", cX, cY), 10, 30, 20, BLACK);
                DrawText(TextFormat("%s", frontWall->passable? "Passable" : "Not passable"), 10, 50, 20, BLACK);
                DrawText(TextFormat("Facing %s", map[facing].c_str()), 10, 70, 20, BLACK);
            }

            DrawRectangle(0, 0, screenWidth, screenHeight, Color{0, 0, 0, (unsigned char)(opacity * 100)});

        EndDrawing();
        if(cY == lula.y && cX == lula.x) {
            died = true;
        }
        updateWalls = false;
    }

    for(auto texture : textureDict) UnloadTexture(texture);

    UnloadTexture(floorTexture);
    UnloadSound(footsteps);
    DrawMiniMap({}, {}, true);

    CloseWindow();
    return 0;
}

void DrawLeftWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color) {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    rlSetTexture(texture.id);
        rlBegin(RL_QUADS);
            rlColor4ub(color.r, color.g, color.b, color.a);
            // Left Face
            rlNormal3f( - 1.0f, 0.0f, 0.0f);    // Normal Pointing Left
            rlTexCoord2f(0.0f, 0.0f); rlVertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Left Of The Texture and Quad
            rlTexCoord2f(1.0f, 0.0f); rlVertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Right Of The Texture and Quad
            rlTexCoord2f(1.0f, 1.0f); rlVertex3f(x - width/2, y + height/2, z + length/2);  // Top Right Of The Texture and Quad
            rlTexCoord2f(0.0f, 1.0f); rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left Of The Texture and Quad
        rlEnd();
    rlSetTexture(0);
}

void DrawRightWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color) {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    rlSetTexture(texture.id);
        rlBegin(RL_QUADS);
            rlColor4ub(color.r, color.g, color.b, color.a);
            // Right face
            rlNormal3f(1.0f, 0.0f, 0.0f);       // Normal Pointing Right
            rlTexCoord2f(1.0f, 0.0f); rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right Of The Texture and Quad
            rlTexCoord2f(1.0f, 1.0f); rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Right Of The Texture and Quad
            rlTexCoord2f(0.0f, 1.0f); rlVertex3f(x + width/2, y + height/2, z + length/2);  // Top Left Of The Texture and Quad
            rlTexCoord2f(0.0f, 0.0f); rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Left Of The Texture and Quad
        rlEnd();
    rlSetTexture(0);
}

void DrawFrontWall(Texture2D texture, Vector3 position, float width, float height, float length, Color color) {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    rlSetTexture(texture.id);
        rlBegin(RL_QUADS);
            rlColor4ub(color.r, color.g, color.b, color.a);
            // Back face
            rlNormal3f(0.0f, 0.0f, - 1.0f);     // Normal Pointing Away From Viewer
            rlTexCoord2f(1.0f, 0.0f); rlVertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Right Of The Texture and Quad
            rlTexCoord2f(1.0f, 1.0f); rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Right Of The Texture and Quad
            rlTexCoord2f(0.0f, 1.0f); rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Left Of The Texture and Quad
            rlTexCoord2f(0.0f, 0.0f); rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Left Of The Texture and Quad
        rlEnd();
    rlSetTexture(0);
}

void DrawFloor(Texture2D texture, Vector3 position, float width, float height, float length, Color color) {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    rlSetTexture(texture.id);
        rlBegin(RL_QUADS);
            rlColor4ub(color.r, color.g, color.b, color.a);
            // Top Face
            rlNormal3f(0.0f, 1.0f, 0.0f);       // Normal Pointing Up
            rlTexCoord2f(0.0f, 1.0f); rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left Of The Texture and Quad
            rlTexCoord2f(0.0f, 0.0f); rlVertex3f(x - width/2, y + height/2, z + length/2);  // Bottom Left Of The Texture and Quad
            rlTexCoord2f(1.0f, 0.0f); rlVertex3f(x + width/2, y + height/2, z + length/2);  // Bottom Right Of The Texture and Quad
            rlTexCoord2f(1.0f, 1.0f); rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Right Of The Texture and Quad
        rlEnd();
    rlSetTexture(0);
}

void DrawCeiling(Texture2D texture, Vector3 position, float width, float height, float length, Color color) {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    rlSetTexture(texture.id);
        rlBegin(RL_QUADS);
            rlColor4ub(color.r, color.g, color.b, color.a);
            // Bottom Face
            rlNormal3f(0.0f, - 1.0f, 0.0f);     // Normal Pointing Down
            rlTexCoord2f(1.0f, 1.0f); rlVertex3f(x - width/2, y - height/2, z - length/2);  // Top Right Of The Texture and Quad
            rlTexCoord2f(0.0f, 1.0f); rlVertex3f(x + width/2, y - height/2, z - length/2);  // Top Left Of The Texture and Quad
            rlTexCoord2f(0.0f, 0.0f); rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Left Of The Texture and Quad
            rlTexCoord2f(1.0f, 0.0f); rlVertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Right Of The Texture and Quad
        rlEnd();
    rlSetTexture(0);
}