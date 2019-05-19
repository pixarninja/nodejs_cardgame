#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int main(void) {
    string line;
    int j;
    for(int k = 0; k <= 1; k++) {
        for(int i = 1; i <= 5; i++) {
            ifstream input;
            ofstream output;
            
            if(k == 0) {
                input.open (to_string(i) + "-8100User" + to_string(i) + "_outputs.dat");
                output.open (to_string(i) + "-8100User" + to_string(i) + "_parsed.dat");
            } else {
                input.open (to_string(i) + "-8500User" + to_string(i) + "_outputs.dat");
                output.open (to_string(i) + "-8500User" + to_string(i) + "_parsed.dat");
            }
            j = 1;
            while ( getline (input,line) )
            {
                if(j != 1) {
                    output << ',';
                }
                output << line;
                j++;
            }
            output.close();
            input.close();
        }
    }
    return 0;
}
