#include "stdio.h"
#include "stdlib.h"

int main(void) {
    char *names[] = {"card-1c", "card-2c",  "card-3c", "card-4c", "card-5c", "card-6c", "card-7c", "card-8c", "card-9c", "card-10c", "card-jc", "card-qc", "card-kc",
      "card-1d", "card-2d",  "3d", "card-4d", "card-5d", "card-6d", "card-7d", "card-8d", "card-9d", "card-10d", "card-jd", "card-qd", "card-kd",
      "card-1h", "card-2h",  "3h", "card-4h", "card-5h", "card-6h", "card-7h", "card-8h", "card-9h", "card-10h", "card-jh", "card-qh", "card-kh",
      "card-1s", "card-2s",  "3s", "card-4s", "card-5s", "card-6s", "card-7s", "card-8s", "card-9s", "card-10s", "card-js", "card-qs", "card-ks"};

    char *serverString[] = {"httpServer.get('/images/", ".jpg', function (req, res) {\n  res.type('image/jpg');\n  res.sendFile(__dirname + 'images/", ".jpg');\n});"};

    char *cssString[] = {"#", " {\n    cursor: move;\n    border-radius: 5%;\n    border: 1px solid white !important;\n    width: 100%;\n    height: 230px;\n    background-image: url('images/", ".jpg');\n    background-size: 100% 100%;\n    position: relative;\n    top: 34px;\n}"};

    int i = 0;
    for (i = 52; i < 52; i++) {
        printf("%s%s%s%s%s\n", serverString[0], names[i], serverString[1], names[i], serverString[2]);
    }
    printf("\n");
    for (i = 0; i < 52; i++) {
        printf("%s%s%s%s%s\n", cssString[0], names[i], cssString[1], names[i], cssString[2]);
    }

    return 0;
}

