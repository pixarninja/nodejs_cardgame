#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int i;
    for(i = 1; i <= 10; i++) {
        printf("     - \"%d:%d\"\n", 8000 + i * 100, 8000 + i * 100);
    }
    return 0;
}
