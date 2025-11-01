#include <cstring>
#include <string>
#include <vector>
#include <math.h>
#include <raylib.h>
#include <rlgl.h>
#include <time.h>
#include "./renderer.cpp"
#include "./map.h"

#define FOV 120.0f
#define TIMEOUT SEC(1)
#define SEC(x) ((x) * 1000)
#define MAP_WIDTH 8
#define MAP_HEIGHT 9
#define TURNTIME 600ms
#define ARR_LEN(arr) (sizeof(arr) / sizeof(arr[0]))

std::string directionMap[] = {
    "LEFT",
    "RIGHT",
    "BACK",
    "FRONT",
};


enum Direction {
    LEFT  = 0,
    RIGHT = 1,
    FRONT = 2,
    BACK  = 3,
};

enum AppState {
    DEFAULT,
    WALK_IN,
    WALK_OUT,
    INIT,
    DEAD,
    WIN,
    TURN_LEFT,
    TURN_RIGHT,
    MENU,
    CREDITS
} state;

struct Lula {
    int x;
    int y;

    Sound soundboard[16];
    int sbSz = 0;

    bool warning = false;
    Texture2D texture;

    Lula(int x, int y) {
        this->x = x;
        this->y = y;
    }
    
    Lula() {}

} lula;

template <typename T = int>
struct Passage {
    int passable;
    T path;

    Passage(int pass, T p) {
        memcpy(&path, &p, sizeof(p));
        passable = pass;
    }

    Passage() {

    }
};

struct ShallowRoom {
    Passage<> paths[4];
};

struct Room {
    Passage<Texture2D*> paths[4];
};

struct PlayerInfo {
    Direction facing = FRONT;
    int x = 0;
    int y = 0;
    int endX = 0;
    int endY = 0;
    bool heldBreath = false;
    Room room;
} player;

time_t timer;
Camera3D camera;
Sound heartbeat;
bool updateWalls = true;
ShallowRoom rooms[9][9];
const int screenWidth = 800;
const int screenHeight = 450;
Texture2D textureDict[32] = {};

inline float Lerp(float start, float end, float amount) { return  start + amount*(end - start); }

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

void DrawMiniMap(Room room, Direction facing, bool destroy = false) {
    static Texture2D tmp[4] = {
        LoadTextureRot("res/player.png", -90),
        LoadTextureRot("res/player.png", 90),
        LoadTextureRot("res/player.png", 0),
        LoadTextureRot("res/player.png", 180),
    };
    static int mWidth = 60;
    static int mHeight = 60;
    static int mPadding = 20;

    if(destroy) {
        for(auto icon : tmp) {
            UnloadTexture(icon);
        }
        return;
    }

    DrawRectangle(screenWidth - mWidth - mPadding, 20, mWidth, mHeight, BLACK);
    DrawRectangleLinesEx({screenWidth - 80, 20, 60, 60}, 2.0f, GRAY);

    if(room.paths[RIGHT].passable)
        DrawRectangle(
            screenWidth - mPadding - 5,
            30,
            10,
            40,
            WHITE
        );
    if(room.paths[LEFT].passable)
        DrawRectangle(
            screenWidth - mWidth - mPadding - 5,
            30,
            10,
            40,
            WHITE
        );
    if(room.paths[BACK].passable)
        DrawRectangle(
            screenWidth - mWidth - mPadding + 10,
            mPadding + mHeight - 5,
            40,
            10,
            WHITE
        );
    if(room.paths[FRONT].passable)
        DrawRectangle(
            screenWidth - mWidth - mPadding + 10,
            mPadding - 5,
            40,
            10,
            WHITE
        );

    DrawTexture(
        tmp[facing],
        (screenWidth - 80 + 30) - tmp[facing].width / 2, (20 + 30) - tmp[facing].height / 2, WHITE);    
}

Room LoadRoom(ShallowRoom unloaded) {
    return {
        Passage<Texture2D*> {
            unloaded.paths[LEFT].passable,
            &textureDict[unloaded.paths[LEFT].path]
        },
        Passage<Texture2D*> {
            unloaded.paths[RIGHT].passable,
            &textureDict[unloaded.paths[RIGHT].path]
        },
        Passage<Texture2D*> {
            unloaded.paths[FRONT].passable,
            &textureDict[unloaded.paths[FRONT].path]
        },
        Passage<Texture2D*> {
            unloaded.paths[BACK].passable,
            &textureDict[unloaded.paths[BACK].path]
        },
    };
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
    state = TURN_RIGHT;
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
    state = TURN_LEFT;
}

template<typename T = Room>
bool Walk(int& y, int& x, T room, Direction facing, bool forward = true) {
    switch(facing) {
        case LEFT: {
            if(!room.paths[LEFT].passable && forward)
                return true;
            else if(!room.paths[RIGHT].passable && !forward)
                return true;
            else {
                if(forward) x++;
                else x--;
            }                
        }; break;

        case RIGHT: {
            if(!room.paths[RIGHT].passable && forward)
                return true;
            else if(!room.paths[LEFT].passable && !forward)
                return true;
            else {
                if(forward) x--;
                else x++;
            }
        }; break;

        case FRONT: {
            if(!room.paths[FRONT].passable && forward)
                return true;
            else if(!room.paths[BACK].passable && !forward)
                return true;
            else 
            {
                if(forward) y++;
                else y--;
            }
        }; break;

        case BACK: {
            if(!room.paths[BACK].passable && forward)
                return true;
            else if(!room.paths[FRONT].passable && !forward)
                return true;
            else {
                if(forward) y--;
                else y++;
            }
        }; break;
    }

    return false;
}

int LulaDistance(Lula lula) {
    return abs(lula.x - player.x) + abs(player.y - lula.y);
}

void LulaWalk(ShallowRoom room, Lula& lula) {
    if(GetRandomValue(0, 1) == 1) {
        int random = GetRandomValue(0, lula.sbSz);
        int distance = LulaDistance(lula) < 1 ? 1 : LulaDistance(lula);

        TraceLog(LOG_INFO, "Played %d %d %f", random, distance, 1.0f / pow(distance, 2));
        SetSoundVolume(lula.soundboard[random], 1.0f / pow(distance, 2));// / pow(LulaDistance(lula), 2));
        StopSound(lula.soundboard[random]);
        PlaySound(lula.soundboard[random]);
    }

    if(LulaDistance(lula) < 5) {
        if(!player.heldBreath) {
            if(player.x < lula.x) lula.x--;
            else if(player.y < lula.y) lula.y--;
            else if(player.x > lula.x) lula.x++;
            else if(player.y > lula.y) lula.y++;
            lula.warning = true;
        }
    }

    int top = 0;
    Direction lulaBuffer[4];
    for(int i = 0; i < 4; ++i) 
        if(room.paths[i].passable)
            lulaBuffer[top++] = (Direction)i;

    if(top == 0) {
        lula = {
            rand() % MAP_WIDTH,
            rand() % MAP_HEIGHT,
        };
        return;
    }

    if(Walk<ShallowRoom>(lula.x, lula.y, room, lulaBuffer[rand() % 4])) {
        lula = {
            rand() % MAP_WIDTH,
            rand() % MAP_HEIGHT,
        };
    }
    if(lula.y < 0 )                 lula.y = 0;
    else if(lula.y >= MAP_HEIGHT)   lula.y = MAP_HEIGHT;
    else if(lula.x < 0 )            lula.x = 0;
    else if(lula.x >= MAP_WIDTH)    lula.x = MAP_WIDTH;
}

Lula InitLula() {
    Lula lulinho;
    do {
        lulinho = Lula{
            rand() % MAP_WIDTH,
            rand() % MAP_HEIGHT
        };
    } while(lulinho.x == 0 || lulinho.y == 0);


    return lulinho;
}

Camera InitCamera() {
    Camera cam;
    cam.position = (Vector3){ 0.0f, 1.0f, 0.0f };
    cam.target = (Vector3){ 0.0f, 1.0f, 1.0f };
    cam.up = (Vector3){ 0.0f, 1.0f, 0.0f };
    cam.fovy = FOV;
    cam.projection = CAMERA_PERSPECTIVE;

    return cam;
}

void InitTextureDictionary() {
    textureDict[0] = LoadTextureRot("./res/bricks.png", 180);
    textureDict[1] = LoadTextureRot("./res/path.png", 180);
    textureDict[2] = LoadTextureRot("./res/carpet.png", 180);
}

void IntroCutscene() {
    static int stage = 0;
    static Texture2D tex = LoadTexture("./res/controls.png");
    
    if(IsKeyPressed(KEY_SPACE)) {
        stage++;
        timer = time(NULL); // reset clock
    }
    
    int fontSize = 40;
    ClearBackground(BLACK);
    switch(stage) {
        case 0: {
            char passages[][64] = {
                "A energia caiu",
                "durante o julgamento do",
                "Bolsonaro",
            };

            DrawCenteredText(passages[0], fontSize, WHITE);
            DrawCenteredText(passages[1], fontSize, WHITE, 0, fontSize * 2);
            DrawCenteredText(passages[2], fontSize, GREEN, 0, fontSize * 4);
        } break;
        case 1: {    

            char passages[][64] = {
                "Como o juíz mais novo",
                "no Supremo Tribunal Federal,",
                "Alexandre de Moraes",
                "te enviou para encontrar",
                "e religar o dijuntor",
            };

            DrawCenteredText(passages[0], fontSize, WHITE, 0, fontSize * -4);
            DrawCenteredText(passages[1], fontSize, WHITE, 0, fontSize * -2);
            DrawCenteredText(passages[2], fontSize, WHITE, 0, 0);
            DrawCenteredText(passages[3], fontSize, WHITE, 0, fontSize *  2);
            DrawCenteredText(passages[4], fontSize, WHITE, 0, fontSize *  4);
        } break;
        case 2:
            DrawTexture(tex, 0, 0, WHITE);
            break;
        case 3: 
            state = DEFAULT;
            UnloadTexture(tex);
        break; 
    }

    if(time(NULL) >= TIMEOUT)
        DrawText("Aperte espaço para continuar", 20, screenHeight - 25, 15, WHITE);
}

bool timeout(time_t whatever) {
    return time(NULL) - timer >= whatever;
}

void GameLoop(bool cleanup = false)
{
    static bool debug = false;

    static Sound footsteps = LoadSound("res/audio/walk.wav");
    static Sound ambiance = LoadSound("./res/audio/ambiance.wav"); 
    static Texture2D& floorTexture = textureDict[2];
    
    static Passage<Texture2D*>* leftWall;
    static Passage<Texture2D*>* frontWall;
    static Passage<Texture2D*>* rightWall;
    


    if(cleanup) {
        UnloadSound(footsteps);
        UnloadSound(ambiance);
        return;
    }
    
    if(player.y == lula.y && player.x == lula.x && !player.heldBreath)
    {
        state = DEAD;
        return;
    }

    if(!IsSoundPlaying(ambiance)) { 
        SetSoundVolume(ambiance, 0.2f);
        PlaySound(ambiance);
    }

    if(player.heldBreath && timeout(300)) {
        timer = time(NULL);
        LulaWalk(rooms[lula.x][lula.y], lula);
     
        if(!IsSoundPlaying(heartbeat))
            PlaySound(heartbeat);
    }

    if(IsKeyPressed(KEY_SPACE)) {
        if(lula.warning) lula.warning = false;

        if(player.x == player.endX && player.y == player.endY) {
            state = WIN;
            return;
        }

        player.heldBreath = !player.heldBreath;
        
        if(!player.heldBreath) StopSound(heartbeat);
        timer = time(NULL);
    }

    
    if(state == TURN_LEFT) {
        if(camera.target.x < 1.75f) camera.target.x += 0.25f;
        else
        {
            camera.target.x = 0.0f;
            updateWalls = true;
            state = DEFAULT;
        }
    }
    if(state == TURN_RIGHT) {
        if(camera.target.x > -1.75f) camera.target.x -= 0.25f;
        else
        {
            camera.target.x = 0.0f;
            updateWalls = true;
            state = DEFAULT;
        }
    }
    else if(IsKeyPressed(KEY_LEFT))
    {
        TurnLeft(player.facing);
    }
    else if(IsKeyPressed(KEY_RIGHT))
    {
        TurnRight(player.facing);
    }
    else if(IsKeyPressed(KEY_UP) && !player.heldBreath)
    {
        if(!Walk(player.y, player.x, player.room, player.facing))
        {
            if(player.y < 0 )               player.y = 0;
            else if(player.y >= MAP_HEIGHT) player.y = MAP_HEIGHT - 1;
            else if(player.x < 0 )          player.x = 0;
            else if(player.x >= MAP_WIDTH)  player.x = MAP_WIDTH - 1;
            else
            {
                if(IsSoundPlaying(footsteps)) StopSound(footsteps);

                state = WALK_IN;
                TraceLog(LOG_INFO, " ==> %d", rooms[player.y][player.x].paths[BACK].path);
                updateWalls = true;
                PlaySound(footsteps);
            }
        }
    }
    else if(IsKeyPressed(KEY_DOWN) && !player.heldBreath)
    {
        if(!Walk(player.y, player.x, player.room, player.facing, false))
        {
            if(player.y < 0 )                 player.y = 0;
            else if(player.y >= MAP_HEIGHT)   player.y = MAP_HEIGHT - 1;
            else if(player.x < 0 )            player.x = 0;
            else if(player.x >= MAP_WIDTH)    player.x = MAP_WIDTH - 1;
            else
            {
                if(IsSoundPlaying(footsteps)) StopSound(footsteps);

                state = WALK_IN;
                TraceLog(LOG_INFO, " ==> %d", rooms[player.y][player.x].paths[BACK].path);
                player.room = LoadRoom(rooms[player.y][player.x]);
                updateWalls = true;
                PlaySound(footsteps);
            }
        }
    }
    else if(IsKeyPressed(KEY_D)) debug = !debug;
    else if(IsKeyPressed(KEY_R) && debug) {
        state = DEAD;
        return;
    }

    if(updateWalls) {
        switch(player.facing) {
            case BACK:
                frontWall = &player.room.paths[BACK];
                leftWall = &player.room.paths[RIGHT];
                rightWall = &player.room.paths[LEFT];
            break;
            case FRONT:
                frontWall = &player.room.paths[FRONT];
                leftWall = &player.room.paths[LEFT];
                rightWall = &player.room.paths[RIGHT];
            break;
            case LEFT:
                frontWall = &player.room.paths[LEFT];
                leftWall = &player.room.paths[BACK];
                rightWall = &player.room.paths[FRONT];
            break;
            case RIGHT:
                frontWall = &player.room.paths[RIGHT];
                leftWall = &player.room.paths[FRONT];
                rightWall = &player.room.paths[BACK];
            break;
        }
        LulaWalk(rooms[lula.x][lula.y], lula);
        TraceLog(LOG_INFO, "ELE %d %d", lula.x, lula.y);
    }

    if(state == WALK_IN)
    {
        if(camera.fovy < 50) {
            TraceLog(LOG_INFO, "%.1f", camera.fovy);
            state = WALK_OUT;
        }
        else camera.fovy *= 0.90;   
    }
    else if(state == WALK_OUT)
    {
        if(camera.fovy >= FOV) {
            camera.fovy = FOV;
            state = DEFAULT;
            player.room = LoadRoom(rooms[player.y][player.x]);
        }
        else camera.fovy *= 1.85;
    }

    BeginDrawing();
        ClearBackground(RAYWHITE);

        BeginMode3D(camera);

            DrawLeftWall(*leftWall->path, (Vector3){ 2.0f, 1.0f, 0.0f }, 2.0f, 2.0f, 2.0f, WHITE);
            DrawRightWall(*rightWall->path, (Vector3){ -2.0f, 1.0f, 0.0f }, 2.0f, 2.0f, 2.0f, WHITE);
            if(lula.x == player.x && lula.y == player.y)
                DrawFrontWall(lula.texture, (Vector3){ 0.0f, 1.0f, 2.0f }, 2.0f, 2.0f, 2.0f, WHITE);
            else
                DrawFrontWall(*frontWall->path, (Vector3){ 0.0f, 1.0f, 2.0f }, 2.0f, 2.0f, 2.0f, WHITE);
            DrawFloor(floorTexture, (Vector3){ 0.0f, 0.0f, 0.0f }, 2.0f, 1.0f, 2.0f, WHITE);
            DrawCeiling(floorTexture, (Vector3){ 0.0f, 2.5f, 0.0f }, 2.0f, 1.0f, 2.0f, WHITE);
            
            DrawSphere(camera.position, 0.5f, {0, 0, 0, 100});
            // DrawSphere(camera.position, 1.0f, {0, 0, 0, 150});
            DrawCubeTexture(lula.texture, (Vector3){ 0.0f, 0.0f, 0.0f }, 0.5f, 0.5f, 0.5f, WHITE);
        EndMode3D();

        DrawMiniMap(player.room, player.facing);

        if(lula.warning) DrawCenteredText("Aperte ESPAÇO para segurar sua respiração", 30, RAYWHITE, 0, screenHeight - 35);

        if(debug) {
            DrawFPS(10, 10);
            DrawText(TextFormat("X %d Y %d", player.x, player.y), 10, 30, 20, BLACK);
            DrawText(TextFormat("%s", frontWall->passable? "Passable" : "Not passable"), 10, 50, 20, BLACK);
            DrawText(TextFormat("Facing %s", directionMap[player.facing].c_str()), 10, 70, 20, BLACK);
            DrawText(TextFormat("Lula %d %d", lula.x, lula.y), 10, 90, 20, BLACK);
            DrawText(TextFormat("End %d %d", player.endX, player.endY), 10, 110, 20, BLACK);

            const char *passage[] = {
                TextFormat("FRONT %d", rooms[player.x][player.y].paths[FRONT].path),
                TextFormat("LEFT %d", rooms[player.x][player.y].paths[LEFT].path),  
                TextFormat("RIGHT %d", rooms[player.x][player.y].paths[RIGHT].path),
                TextFormat("BACK %d", rooms[player.x][player.y].paths[BACK].path),  
            };

            DrawText(passage[0], screenWidth - 10 - MeasureText(passage[0], 20), 20, 20, GREEN);
            DrawText(passage[1], screenWidth - 10 - MeasureText(passage[1], 20), 40, 20, GREEN);
            DrawText(passage[2], screenWidth - 10 - MeasureText(passage[2], 20), 60, 20, GREEN);
            DrawText(passage[3], screenWidth - 10 - MeasureText(passage[3], 20), 80, 20, GREEN);
        }

        
        if(player.x == player.endX && player.y == player.endY)
        {
            DrawCenteredText("Aperte espaço para", 30, WHITE, 0, screenHeight - 70);   
            DrawCenteredText("religar o dijuntor", 20, WHITE, 0, screenHeight - 25);   
        }
    EndDrawing();
    

    updateWalls = false;
}

void InitGame() {
    camera = InitCamera();
    lula = InitLula();
    state = MENU;

    player.facing = FRONT;
    player.x = 0;
    player.y = 0;
    
reGenXY:
    player.endX = GetRandomValue(0, MAP_WIDTH);
    player.endY = GetRandomValue(0, MAP_HEIGHT);

    for(auto adj : rooms[player.endX][player.endY].paths)
        if(adj.passable) goto next;

    goto reGenXY;
next:

    player.heldBreath = false;
    player.room = LoadRoom(rooms[0][0]);
    updateWalls = true;
}

void WinCutscene() {
    static int stage = 0;
    static float overlayOpacity = 0.0f;
    static Color bg = DARKGREEN;
        
    if(IsKeyPressed(KEY_SPACE)) {
        stage++;
        timer = time(NULL); 
    }

    if(overlayOpacity != 2.5) 
        overlayOpacity += 0.05;

    DrawRectangle(0, 0, screenWidth, screenHeight, { bg.r, bg.g, bg.b, (unsigned char)(int)trunc(100.0f * overlayOpacity) });
    
    switch(stage) {
        case 0:
            if(overlayOpacity >= 2.5) DrawCenteredText("Você reconectou a energia!", 40, WHITE);
        break;
        case 2:
            DrawCenteredText("XANDANGO", 60, BLUE,                                         0, 60 * 2);
        case 1:
            bg = BLACK;
            DrawCenteredText("Bolsonaro é sentenciado a", 35, WHITE, 0, 40 * -4);
            DrawCenteredText("13 prisões perpétuas", 35, WHITE, 0, 40 * -2);
            DrawCenteredText("Xandão, orgulhoso, lhe promove a ", 35, WHITE, 0, 0);
        break;
        case 3: 
            state = CREDITS;
        break;
    }
    
    if(time(NULL) - timer >= TIMEOUT)
        DrawText("Aperte espaço para continuar", 20, screenHeight - 20, 10, WHITE);
}

bool DrawButton(Rectangle dim, const char* text, Color bg, Color highlight, Color textColor = WHITE) {
    Color background = bg;
    bool ret = false;

    if(CheckCollisionPointRec(GetMousePosition(), dim)) {
        if(IsMouseButtonPressed(MOUSE_LEFT_BUTTON))
        {
            ret = true;
        }        
        background = highlight;
    }

    DrawRectangle(dim.x, dim.y, dim.width, dim.height, background);
    

    DrawText(text, dim.x + MeasureText(text, 20) / 2, dim.y + 20 / 2, 20, textColor);
    
    return ret;
}

void Menu() {
    static Texture2D background = LoadTexture("./res/menu.png");

    BeginDrawing();
        DrawTexture(background, 0, 0, WHITE);

        DrawRectangle(0, 0, screenWidth, screenHeight, {0, 0, 0, 100});
        DrawCenteredText("STF", 120, {200, 0, 0, 255});
        DrawCenteredText("Masmorras", 100, WHITE);

        if(DrawButton(
            { 20, screenHeight - 60, (float)MeasureText("PLAY", 20) * 2, 40},
            "PLAY",
            { 32, 32, 32, 255 },
            { 128, 0, 0, 255 }
        )) state = INIT;

        static char* passages[] = {
            "BETA",
            "Esse jogo está CHEIO de bugs",
            "para continuar jogando",
            "aperte D (debug) e R (reiniciar jogo)",
        };

        DrawText(passages[0], screenWidth - MeasureText(passages[3], 20), 10, 20, {255, 0, 0, 255});
        DrawText(passages[1], screenWidth - MeasureText(passages[3], 20), 30, 20, {255, 0, 0, 255});
        DrawText(passages[2], screenWidth - MeasureText(passages[3], 20), 50, 20, {255, 0, 0, 255});
        DrawText(passages[3], screenWidth - MeasureText(passages[3], 20), 70, 20, {255, 0, 0, 255});
    EndDrawing();
}

void GameOver() {
    static int stage = 0;
    static int opacity = 0;
    static bool once = true;
    static Sound zeGota = LoadSound("./res/audio/zegotinha.wav");
    static Image lulaImg = LoadImage("./res/lula.png");
    static Texture lulaTxt;
    
    switch(stage) {
        case 0:
            if(once) {
                TraceLog(LOG_INFO, "Game over %d", opacity);
                PlaySound(zeGota);

                ImageResize(&lulaImg, screenWidth, screenHeight);
                lulaTxt = LoadTextureFromImage(lulaImg);
                UnloadImage(lulaImg);
                once = false;
                timer = time(NULL);
            }
            // TraceLog(LOG_INFO, "Game over %d", opacity);
            DrawTexture(lulaTxt, 0, 0, WHITE);
            
            if(!IsSoundPlaying(zeGota)) {
                stage++;
                UnloadSound(zeGota);
            }
        break;
        case 1:
            if(opacity < 256) opacity += 1;
            else state = CREDITS;
            ClearBackground({0, 0, 0, (unsigned char)opacity});
        break;
    }
}

int main(void)
{
    InitWindow(screenWidth, screenHeight, "Masmorras do STF");
    InitAudioDevice();
    SetTargetFPS(60);
    rlDisableBackfaceCulling();
    
    InitTextureDictionary();

    // lula.sound = LoadSound("./res/audio/hino.wav");
    lula.texture = LoadTexture("./res/lula.png");

    lula.soundboard[lula.sbSz++] = LoadSound("./res/audio/banana.wav");
    lula.soundboard[lula.sbSz++] = LoadSound("./res/audio/manga.wav");

    heartbeat = LoadSound("./res/audio/heartbeat.wav");

    char* token = strtok((char*)map, ";");

    while(token) {
        int x, y;
        int ret;
        ShallowRoom tmp;
        TraceLog(LOG_DEBUG, "TK: %s\n", token);

        if((ret = sscanf(
            token,
            "%d:%d, %d %d, %d %d, %d %d, %d %d",
                &x, &y,
                &tmp.paths[LEFT].passable,     &tmp.paths[LEFT].path,
                &tmp.paths[RIGHT].passable,    &tmp.paths[RIGHT].path,
                &tmp.paths[FRONT].passable,    &tmp.paths[FRONT].path,
                &tmp.paths[BACK].passable,     &tmp.paths[BACK].path
            )) == 10)     
        {
            rooms[x][y] = tmp;
            TraceLog(LOG_DEBUG, "RM: %d:%d, %d %d, %d %d, %d %d, %d %d\n",
                x, y,
                rooms[x][y].paths[LEFT].passable,     rooms[x][y].paths[LEFT].path,
                rooms[x][y].paths[RIGHT].passable,    rooms[x][y].paths[RIGHT].path,
                rooms[x][y].paths[FRONT].passable,    rooms[x][y].paths[FRONT].path,
                rooms[x][y].paths[BACK].passable,     rooms[x][y].paths[BACK].path
            );
        }
        // else if(sscanf(
        //     token,
        //     ">%d %d",
        //     &player.endX, &player.endY
        // ) == 2);
        else TraceLog(LOG_FATAL, "Parsing error for file at token #(%d) '%s'", ret, token);

        token = strtok(NULL, ";");
    }

    InitGame();

    // if(player.endX < 0 || player.endX > ARR_LEN(rooms) || player.endY < 0 || player.endY > ARR_LEN(rooms[0]))
    //     TraceLog(LOG_FATAL, "No end for map.");

    float overlayOpacity = 0.0f;
    
    player.room = LoadRoom(rooms[0][0]);
    bool once = true;
    while (!WindowShouldClose())
    {
        switch(state) {
            case MENU:
                Menu();
            break;
            case INIT:
                BeginDrawing();
                    IntroCutscene();
                EndDrawing();
            break;
            break;
            case DEAD:
                BeginDrawing();
                        GameOver();
                EndDrawing();
            break;
            case WIN:
                BeginDrawing();
                    WinCutscene();
                EndDrawing();
            break;
            case CREDITS:
                BeginDrawing();
                    ClearBackground(BLACK);
                    DrawCenteredText("Um jogo por", 40, WHITE, -MeasureText("EncheDev", 40));
                    DrawCenteredText("EncheDev", 40, YELLOW, MeasureText("Um jogo por ", 40));

                    // if(DrawButton(
                    //     {
                    //         20, screenHeight - 70,
                    //         (float)MeasureText("Jogar denovo", 20) * 2,
                    //         40,
                    //     },
                    //     "Jogar denovo",
                    //     {32, 32, 32, 255},
                    //     {128, 128, 128, 255})
                    // )
                    //     InitGame();
                EndDrawing();
            break;
            case TURN_LEFT:
            case TURN_RIGHT:
            case WALK_IN:
            case WALK_OUT:
            case DEFAULT:
                GameLoop();
            break;
        }       
    }
    DrawMiniMap({}, {}, true); 
    GameLoop(true); 
    for(auto texture : textureDict) UnloadTexture(texture); 
    // UnloadSound(lula.sound);
    UnloadTexture(lula.texture);
    for(auto sound : lula.soundboard) UnloadSound(sound);

    CloseWindow();
    return 0;
}