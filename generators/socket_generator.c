#include "stdio.h"
#include "stdlib.h"

int main(void) {
    int base = 8000;
    int i;
    for(i = 0; i < 1000; i++) {
        printf("%d\n", base + i);
    }

    return 0;
}

