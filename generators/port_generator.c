#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int i;
    for(i = 0; i < 10; i++) {
        printf("     - \"%d:%d\"\n", 8001 + i, 8001 + i);
    }
    return 0;
}
